declare module '@lblod/marawa/rdfa-context-scanner' {
  interface RichNode {
    context: Triple;
  }

  export interface Triple {
    predicate: string;
    object: string;
    subject: unknown;
  }
  export function analyse(node: Node): RichNode[];
}
