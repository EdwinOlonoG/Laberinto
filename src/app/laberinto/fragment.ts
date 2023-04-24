export interface fragment {
    terrain: number;
    row: number;
    col: string;
    isOccupied: boolean;
    isVisible: boolean;
    visited: boolean;
    initial: boolean;
    final: boolean;
    needsDesicion: boolean;
    cost: number;
}