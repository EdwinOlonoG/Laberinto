import {Component} from '@angular/core';
import {fragment} from './fragment';
import {Node} from './node';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';


@Component({selector: 'app-laberinto', templateUrl: './laberinto.component.html', styleUrls: ['./laberinto.component.css']})
export class LaberintoComponent {

    public initialCol : string = "A";
    public initialRow : string = "10";
    public finalCol : string = "E";
    public finalRow : string = "10";
    public conjuntoAbierto : any[] = [];
    public stepByStep : boolean = true;
    public deepSearch : boolean = false;
    public agent : string = 'monkey';
    public monkey : any = {
        '0': '?',
        '1': 2,
        '2': 4,
        '3': 3,
        '4': 1
    }
    public octopus : any = {
        '0': '?',
        '1': 2,
        '2': 4,
        '3': '?',
        '4': 1
    }

    public file : any;
    public map : fragment[] = [];
    public terrainTypes = [''];
    public alphabeth = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O'
    ];
    public movies = ['Up', 'Down', 'Left', 'Right'];
    public solution : any[] = [];

    constructor() {}

    public ngOnInit() {}

    public loadFile(e : any) {
        this.file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.buildMap(reader.result);
        };
        reader.readAsText(this.file);
    }

    private buildMap(content : any) {
        let mapArray = content.replaceAll('\r\n', ',').split(',');
        let width = content.replaceAll(',', '').split('\r')[0].length;
        let height = mapArray.length / width;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                this.map.push({
                    terrain: mapArray[(
                            (i * 15)
                        ) + j],
                    col: this.alphabeth[j],
                    row: i,
                    isOccupied: false,
                    isVisible: false,
                    visited: false,
                    initial: false,
                    final: false,
                    needsDesicion: false,
                    cost: 0
                })
            }
        }
    }

    public changeTerrain(fragment : fragment) {
        if (fragment.terrain == 4) {
            fragment.terrain = 0;
        } else {
            fragment.terrain = fragment.terrain + 1;
        }
    }

    public getFragmentInfo(fragment : fragment) {
        console.log(fragment);
    }

    public toggleVisibility(fragment : fragment) {
        fragment.isVisible = !fragment.isVisible
    }

    public setPoints() {
        let col = this.alphabeth.indexOf(this.finalCol);
        let row = parseInt(this.finalRow) - 1;

        this.map[row * 15 + col].final = true;
        col = this.alphabeth.indexOf(this.initialCol);
        row = parseInt(this.initialRow) - 1;
        this.map[row * 15 + col].initial = true;
        return [col, row]
    }

    public solve() {
        let [col, row] = this.setPoints();
        this.revealAround(col, row);
        this.moveForward(col, row);
    }

    drop(event : CdkDragDrop < string[] >) {
        moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
    }

    public revealAround(col : number, row : number) {

        this.getFragment(col, row).isVisible = true;
        if (col != 14) {
            this.getFragment(col + 1, row).isVisible = true;
        }

        if (col != 0) {
            this.getFragment(col - 1, row).isVisible = true;
        }

        if (row != 0) {
            this.getFragment(col, row - 1).isVisible = true;
        }

        if (row != 14) {
            this.getFragment(col, row + 1).isVisible = true;
        }
    }

    public moveTo(move : string, col : number, row : number): [number, number]{
        switch (move) {
            case 'Up':
                [col, row] = this.moveUp(col, row);
                break;
            case 'Right':
                [col, row] = this.moveRight(col, row);
                break;
            case 'Down':
                [col, row] = this.moveDown(col, row);
                break;
            case 'Left':
                [col, row] = this.moveLeft(col, row);
                break;
        }
        return [col, row];
    }

    public takeDesicion() {
        let search = 0
        if (this.deepSearch) {
            search = this.conjuntoAbierto.length - 1
        }
        let col = this.conjuntoAbierto[search].col;
        let row = this.conjuntoAbierto[search].row;
        let time = 0;
        if (this.stepByStep) {
            time = 1000;
        }
        this.remove(col, row);
        let possibleMoves = this.getPosibleMoves(col, row);
        if (possibleMoves.length == 0) {
            if (this.deepSearch) {
                this.conjuntoAbierto.pop();
            } else {
                this.conjuntoAbierto.shift();
            }
            this.takeDesicion();
        } else {
            [col, row] = this.moveTo(possibleMoves[0], col, row);
            this.revealAround(col, row);
            if (this.isEndRoad(col, row)) {
                console.log('end');
                return;
            } else {
                setTimeout(() => this.moveForward(col, row), time);
            }
        }
    }

    public isEndRoad(col : number, row : number): boolean {
        return this.getFragment(col, row).final;
    }

    public moveForward(col : number, row : number) {
        let time = 0;
        if (this.stepByStep) {
            time = 1000;
        }
        let possibleMoves = this.getPosibleMoves(col, row);
        const possibilities = possibleMoves.length;

        if (possibilities > 1) {
            this.getFragment(col, row).needsDesicion = true;
            this.conjuntoAbierto.push({col: col, row: row});
            setTimeout(() => this.takeDesicion(), 1000);
        } else if (possibilities == 1) {
            this.remove(col, row);
            [col, row] = this.moveTo(possibleMoves[0], col, row);
            this.revealAround(col, row);
            if (this.isEndRoad(col, row)) {
                console.log('llegamos al final', this.getFragment(col, row));
                return;
            } else {
                setTimeout(() => this.moveForward(col, row), time);
            }
        } else {
            this.remove(col, row);
            this.takeDesicion();
            return;
        }
    }

    public getFragment(col : number, row : number): fragment {
        return this.map[row * 15 + col];
    }

    public getPosibleMoves(col : number, row : number) {
        let possibleMoves = []
        const right = this.getFragment(col + 1, row);
        const left = this.getFragment(col - 1, row);
        const down = this.getFragment(col, row + 1);
        const up = this.getFragment(col, row - 1);

        if (row != 0) {
            if (up.terrain == 1 && ! up.visited) {
                possibleMoves.push('Up');
            }
        }
        if (col != 14) {
            if (right.terrain == 1 && ! right.visited) {
                possibleMoves.push('Right');
            }
        }
        if (row != 14) {
            if (down.terrain == 1 && ! down.visited) {
                possibleMoves.push('Down');
            }
        }
        if (col != 0) {
            if (left.terrain == 1 && ! left.visited) {
                possibleMoves.push('Left');
            }
        }
        possibleMoves = this.sortMoves(possibleMoves);
        return possibleMoves;
    }

    public sortMoves(moves : string[]) {
        let movesSorted: string[] = [];
        this.movies.forEach(move => {
            if (moves.includes(move)) {
                movesSorted.push(move)
            }
        });
        return movesSorted;
    }

    public moveRight(col : number, row : number) {
        this.getFragment(col + 1, row).isOccupied = true;
        return [
            col + 1,
            row
        ];
    }

    public moveLeft(col : number, row : number) {
        this.getFragment(col - 1, row).isOccupied = true;
        return [
            col - 1,
            row
        ];
    }

    public moveUp(col : number, row : number) {
        this.getFragment(col, row - 1).isOccupied = true;
        return [
            col,
            row - 1
        ];
    }

    public moveDown(col : number, row : number) {
        this.getFragment(col, row + 1).isOccupied = true;
        return [
            col,
            row + 1
        ];
    }

    private remove(col : number, row : number) {
        this.getFragment(col, row).visited = true;
        this.getFragment(col, row).isOccupied = false;
    }

    private getCost(col : number, row : number) {
        if (row > 14) {
            return -1
        }
        let terrain = this.getFragment(col, row).terrain;
        if (this.agent == 'monkey') {
            if (this.monkey[terrain] == '?') {
                return -1;
            } else {
                return parseInt(this.monkey[terrain]);
            }
        } else {
            if (this.octopus[terrain] == '?') {
                return -1;
            } else {
                return parseInt(this.octopus[terrain]);
            }
        }
    }

    private getDistance(col : number, row : number): number {
        let finalCol = this.alphabeth.indexOf(this.finalCol);
        let finalRow = parseInt(this.finalRow) - 1;
        let distance = 0;
        if (finalCol > col) {
            distance = finalCol - col;
        } else {
            distance = col - finalCol;
        }
        if (finalRow > row) {
            distance = distance + finalRow - row;
        } else {
            distance = distance + row - finalRow;
        }
        return distance;
    }

    private createNode(col : number, row : number, nodeParent : Node) {
        if (this.getCost(col, row) == -1 || this.isParent(col, row, nodeParent)) {
            return;
        }
        const newCost = nodeParent.cost + this.getCost(col, row);
        const distance = this.getDistance(col, row);
        let parents = nodeParent.parents.slice();

        this.getFragment(col, row).needsDesicion = true;
        this.getFragment(col, row).cost = newCost;
        /* nodeParent.childrens.push({col: col, row: row}); */
        parents.push(nodeParent);
        // parents.push({col: nodeParent.col, row: nodeParent.row});
        const node: Node = {
            parents: parents,
            // childrens: [],
            col: col,
            row: row,
            cost: newCost,
            distance: distance,
            total: newCost + distance
        }
        console.log(node);
        this.checkDuplicate(node);
    }

    private isParent(col : number, row : number, parent : any) {
        if (parent.parents.length == 0) {
            return false;
        }
        let p = parent.parents[parent.parents.length - 1];
        if (col == p.col && row == p.row) {
            return true;
        }
        return false;
    }

    private checkDuplicate(node : any) {
        let c = this.conjuntoAbierto;
        for (let i = 0; i < c.length; i++) {
            if (c[i].col == node.col && c[i].row == node.row) {
                if (node.total<= c[i].total){
                        console.log('elimine a', c[i]);
                    c[i] = node;
                    return
                }
            }
       }
       this.conjuntoAbierto.push(node);
    }

    private extend(node: Node){
        let col = node.col;
        let row = node.row;
        this.getFragment(col, row).isOccupied = true;
        this.getFragment(col, row).needsDesicion = false;
        this.getFragment(col, row).cost = 0;
        
        if (col != 0) {
            this.createNode(col - 1, row, node);
        }
        if (col != 14) {
            this.createNode(col + 1, row, node);
        }
        if (row != 0) {
            this.createNode(col, row - 1, node);
        }
        if (col != 14) {
            this.createNode(col, row + 1, node);
        }
        return;
    }

    private sortArray() {
        this.conjuntoAbierto.sort(function (a, b) {
            if (a.total> b.total) {
                    return 1;
                }
                if (a.total<b.total) {
                        return -1;
                    }
                    return 0;
                }
            );
        }

    public solveA() {
        let [col, row] = this.setPoints();
        this.revealAround(col, row);
        this.extend({col: col, row: row, parents: [], cost: 0, distance: this.getDistance(col, row), total: this.getDistance(col, row)});
        this.sortArray();
        this.steper();
    }

    public steper(){
        let node = this.conjuntoAbierto.shift();

        this.revealAround(node.col, node.row);
        if (this.isEndRoad(node.col, node.row)) {
            this.solution = node.parents;
            this.solution.push(node);
            this.conjuntoAbierto.push(node);
            return;
        }
        this.extend(node);
        this.sortArray();
        
            setTimeout(()=> {
                    this.steper()
                }, 1000) 
                
            }

            public step() {
                if (this.conjuntoAbierto.length == 0) {
                    let [col, row] = this.setPoints();
                    this.revealAround(col, row);
                    this.extend({
                        col: col,
                        row: row,
                        parents: [],
                        cost: 0,
                        distance: this.getDistance(col, row),
                        total: this.getDistance(col, row)
                    });
                    this.sortArray();
                } else {
                    let node = this.conjuntoAbierto.shift();

                    this.revealAround(node.col, node.row);
                    if (this.isEndRoad(node.col, node.row)) {
                        this.solution = node.parents;
                        this.solution.push(node);
                        this.conjuntoAbierto.push(node);
                        return
                    }
                    this.extend(node);
                    this.sortArray();
                }
            }

            public changeAgent(agent : string) {
                this.agent = agent;
            }

            public showAllMap() {
                this.map.forEach(element => {
                    element.isVisible = true;
                });
            }

            public hideAllMap() {
                this.map.forEach(element => {
                    element.isVisible = false;
                });
            }
        }
