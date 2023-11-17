class GameOfLIfe {

    constructor(options = {}) {
        this.options = {...this.defaultOptions, ...options}
        this.body = document.querySelector('body');
        this.init_canvas();
        this.draw_empty();
        this.initEvents();
    }

    static game_init(options){
        return new GameOfLIfe(options)
    }

    defaultOptions = {
        x: 600,
        y: 600,
        cellSize: 5,
        interval: 1000/24,
        fieldColor: '#F3EEEA',
        cellColor: '#435585',
    }

    canvas;
    interval_id;
    cells;
    frameStart;
    frameEnd;
    frameSpeed;
    line;
    gen = 0;
    alive = 0;

    startBtn = document.querySelector('[data-start]');
    handBtn = document.querySelector('[data-fill]');
    refreshBtn = document.querySelector('[data-refresh]');
    randomBtn = document.querySelector('[data-random]');
    fColorInp = document.querySelector('[data-field-color]');
    cColorInp = document.querySelector('[data-cell-color]');
    widthInp = document.querySelector('[data-field-width]');
    heightInp = document.querySelector('[data-field-height]');
    cellSize = document.querySelector('[data-cell-size]');
    frameInp = document.querySelector('[data-framerate]');
    genInp = document.querySelector('[data-gen]');
    speedSel = document.querySelector('[data-speed]');
    aliveInp = document.querySelector('[data-alive]');
 
    init_canvas() {
        this.body.querySelector('canvas')?.remove();
        this.canvas = document.createElement('canvas');
        document.querySelector('body').insertAdjacentElement('afterbegin', this.canvas);
        this.check_data();
        this.canvas.width = this.options.x;
        this.canvas.height = this.options.y;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.width = this.canvas.width;
        this.ctx.height = this.canvas.height;
        this.get_lines();
    }

    get_lines() {
        let res;
        if(this.options.cellSize >= 3){
            res = 1;
        } else {
            res = 0.25;
        }
        this.line = res;
    }

    check_data() {
        let w_left, h_left;
        w_left = this.options.x % this.options.cellSize;
        h_left = this.options.y % this.options.cellSize;
        if(w_left > 0) {
            this.options.x =  this.options.x - w_left;
        }
        if(h_left > 0) {
            this.options.y = this.options.y - h_left;
        }

        this.widthInp.value = this.options.x;
        this.heightInp.value = this.options.y;
        this.cellSize.value = this.options.cellSize;
        this.cColorInp.value = this.options.cellColor.replace('#', '');
        this.fColorInp.value = this.options.fieldColor.replace('#', '');
    }

    zeros = () =>{
       
        let a, i, j, m, n, mat = [];
    
        m = this.options.y / this.options.cellSize;
        n = this.options.x / this.options.cellSize;
    
        for (i = 0; i < m; i++) {
            a = [];
    
            for (j = 0; j < n; j++) {
                a[j] = 0;
            }
            mat[i] = a;
        }
        mat['rows'] = m;
        mat['cols'] = n;
       
        return mat;
    }

    initialize_cells = (cells) =>  {
        let i, j;
        this.alive = 0;
        for (i = 0; i < cells['rows']; i++) {
            for (j = 0; j < cells['cols']; j++) {
                if (Math.random() < 0.5) {
                    cells[i][j] = 1;
                    this.alive++
                }
            }
        }
        this.aliveInp.value = this.alive;
        return cells;
    }

    draw_cells = (context, cells) => {
        let i, j;
        this.alive = 0;
        for (i = 0; i < cells['rows']; i++) {
            for (j = 0; j < cells['cols']; j++) {
                if (cells[i][j] === 1) {
                    context.fillStyle = this.options.cellColor;
                    this.alive++;
                } else {
                    context.fillStyle = this.options.fieldColor;
                }
                let from_top = i * this.options.cellSize;
                let from_left = j * this.options.cellSize;
                context.fillRect(from_left + this.line, from_top + this.line, this.options.cellSize - this.line*2, this.options.cellSize - this.line*2);
            }
        }
        this.aliveInp.value = this.alive;
    }

    draw_empty() {
        this.cells = this.zeros();
        this.draw_cells(this.ctx, this.cells);
        this.canvas.onclick = this.mouseEvent;
    }

    copy_cells = (source, dest) => {
        var i, j;
        for (i = 0; i < source['rows']; i++) {
            for (j = 0; j < source['cols']; j++) {
                dest[i][j] = source[i][j];
            }
        }
        return dest;
    }

    update = (cells) => {
        let i, j, k, l;
        let old_cells, live_neighbors;
        let col_min, col_max, row_min, row_max, l_row_i, l_col_i;
    
        old_cells = this.copy_cells(cells, this.zeros());

        l_row_i = cells['rows']-1;
        l_col_i = cells['cols']-1;
        
        for (i = 0; i < cells['rows']; i++) {
            for (j = 0; j < cells['cols']; j++) {
                live_neighbors = 0;
    
                row_min = Math.max(0, i - 1);
                row_max = Math.min(cells['rows'], i + 2);
                col_min = Math.max(0, j - 1);
                col_max = Math.min(cells['cols'], j + 2);
                
                if(i === 0) {
                   for(l = col_min; l < col_max; l++ ) {
                        if(old_cells[l_row_i][l]===1) {
                            live_neighbors++;
                        } 
                   }
                } else if (i === l_row_i) {
                    for(l = col_min; l < col_max; l++ ) {
                        if(old_cells[0][l]===1) {
                            live_neighbors++;
                        } 
                   }
                }

                if(j === 0) {
                    for(l = row_min; l < row_max; l++ ) {
                        if(old_cells[l][l_col_i]===1) {
                            live_neighbors++;
                        } 
                   }
                } else if (j === l_col_i) {
                    for(l = row_min; l < row_max; l++ ) {
                        if(old_cells[l][0]===1) {
                            live_neighbors++;
                        } 
                   }
                }

                for (k = row_min; k < row_max; k++) {
                    for (l = col_min; l < col_max; l++) {
                        if (old_cells[k][l] === 1) {
                            live_neighbors++;
                        }
                    }
                }
      
                if (old_cells[i][j] === 1) {
                    live_neighbors--;
                    if (live_neighbors !== 2 && live_neighbors !== 3) {
                        cells[i][j] = 0;
                    }
                } else {
                    if (live_neighbors === 3) {
                        cells[i][j] = 1;
                    }
                }
            }
        }
        return cells;
    }

    init_sim = () => {
       this.cells = this.initialize_cells(this.zeros());
    }

    set_gen(state) {
        if(state === '+') {
            this.gen++
        } else {
            this.gen = 0;
        }
        this.genInp.value = this.gen;
    }

    run_sim = () => {
        let cells = this.cells;
        let context = this.ctx;
        this.frameStart = performance.now();
        this.update(cells);
        this.draw_cells(context, cells);
        this.frameEnd = performance.now();
        this.frameInp.value =((this.frameEnd - this.frameStart)).toFixed(2) + ' /ms';
        this.set_gen('+');
    }

    on_key_press = (event) => {
        let self = this;
        var key = String.fromCharCode(event.charCode);
        if (key === ' ') {
            if (self.interval_id) {
                self.stopAction();
            } else {
                self.interval_id = window.setInterval(self.run_sim, self.options.interval);
                self.startBtn.textContent = 'Стоп';
            }
    
        } else if (key === 'n') {
            self.run_sim();

        } else if (key === 'r') {
            window.clearInterval(self.interval_id);
            self.init_sim();
            self.interval_id = window.setInterval(self.run_sim, self.options.interval);
            self.set_gen('-');
        }
    }

    mouseEvent = (e) => {
        if (this.interval_id) {
            this.stopAction();
        }
        let i, j, topX, topY;
        i = Math.round((e.offsetY - this.options.cellSize/2)/this.options.y*this.cells['rows']);
        j = Math.round((e.offsetX - this.options.cellSize/2)/this.options.x*this.cells['cols']);
        if (this.cells[i][j] === 1) {
            this.cells[i][j] = 0;
            this.ctx.fillStyle = this.options.fieldColor;
            this.alive--
        } else {
            this.cells[i][j] = 1;
            this.ctx.fillStyle = this.options.cellColor;
            this.alive++
        }
        topX = j*this.options.cellSize;      
        topY = i*this.options.cellSize;
        this.ctx.fillRect(topX + this.line, topY + this.line, this.options.cellSize - this.line*2, this.options.cellSize -  this.line*2 );
        this.aliveInp.value = this.alive;
    }   

    stopAction() {
        window.clearInterval(this.interval_id);
        this.interval_id = null;
        this.startBtn.textContent = 'Старт';
    }

    startEvent = () => {
        let self = this
        if (self.interval_id) {
            self.stopAction();
        } else {
            self.interval_id = window.setInterval(self.run_sim, self.options.interval);
            self.startBtn.textContent = 'Стоп';
        }
    }

    handEvent = () => {
        this.stopAction();
        this.init_canvas();
        this.cells = this.zeros();
        this.draw_cells(this.ctx, this.cells);
        this.canvas.onclick = this.mouseEvent;
        this.set_gen('-');
    }

    randomEvent = () => {
        this.stopAction();
        this.init_canvas();
        this.init_sim();
        this.draw_cells(this.ctx, this.cells);
        this.canvas.onclick = this.mouseEvent;
        this.set_gen('-');
    }

    fieldColorEvent = (e) => {
        if (e.target.value.length >= 3 && e.target.value.length <= 6 ) {
            this.options.fieldColor = '#' + e.target.value;
        }
    }

    cellColorEvent = (e) => {
        if (e.target.value.length >= 3 && e.target.value.length <= 6 ) {
            this.options.cellColor = '#' + e.target.value;
        }
    }

    fieldWithEvent = (e) => {
        this.stopAction();
        setTimeout(() => {
            this.options.x = e.target.value;
            this.init_canvas();
            this.draw_empty();
        }, 1000);
        this.set_gen('-');
    }

    fieldHeigthEvent = (e) => {
       
        this.stopAction();
        setTimeout(() => {
            this.options.y = e.target.value;
            this.init_canvas();
            this.draw_empty();
        }, 1000);
        this.set_gen('-');
    }

    cellSizeEvent = (e) => {
        this.stopAction();
        setTimeout(() => {
            this.options.cellSize = e.target.value;
            this.init_canvas();
            this.draw_empty();
        }, 1000);
    }

    speedEvent = (e) => {
        if(this.interval_id) {
            this.stopAction();
            this.options.interval = e.target.value;
            this.startEvent()
        } else {
            this.options.interval = e.target.value;
        }
    }

    initEvents() {
        this.startBtn.addEventListener('click', this.startEvent);
        this.handBtn.addEventListener('click', this.handEvent);
        this.randomBtn.addEventListener('click', this.randomEvent);
        this.fColorInp.addEventListener('input', this.fieldColorEvent);
        this.cColorInp.addEventListener('input', this.cellColorEvent);
        this.widthInp.addEventListener('input', this.fieldWithEvent);
        this.heightInp.addEventListener('input', this.fieldHeigthEvent);
        this.cellSize.addEventListener('input', this.cellSizeEvent);
        this.speedSel.addEventListener('change', this.speedEvent);
        window.onkeypress = this.on_key_press;
    }
}

document.addEventListener('DOMContentLoaded', function(){
    GameOfLIfe.game_init();
    document.querySelectorAll('input').forEach(inp => {
        active_label(inp);
        inp.addEventListener('input', function(e){
            e.preventDefault()
            active_label(this);
        });
        inp.addEventListener('change', function(e){
            e.preventDefault()
            active_label(this);
        })
    })
});

let active_label = function(elem) {
    if (elem.value !== '') {
        elem.classList.add('active');
    } else {
        elem.classList.remove('active');
    }
}