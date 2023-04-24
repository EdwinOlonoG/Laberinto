export interface Node {
    col: number,
    row: number,
    parents: Node[],
    // childrens: Node[],
    cost: number,
    distance: number,
    total: number
}

interface parent{
    col: number,
    row: number
}

interface children{
    col: number,
    row: number
}