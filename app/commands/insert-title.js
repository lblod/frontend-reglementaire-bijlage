import { v4 as uuid } from 'uuid';

export default function insertTitle(intl) {
  return function (state, dispatch) {
    const { schema, selection } = state;
    //try {
      if (
        !state.doc.canReplaceWith(
          selection.$from.index(0),
          selection.$from.index(0),
          schema.nodes.document_title
        )
      ) {
        return false;
      }
    /*} catch (e) {
      return false;
    }*/

    if (dispatch) {
      const tr = state.tr;
      tr.insert(
        selection.from - 1,
        schema.node(
          'document_title',
          { __rdfaId: uuid() },
          schema.node(
            'paragraph',
            null,
            schema.node('placeholder', {
              placeholderText: intl.t(
                'reglement-edit.document-title-placeholder'
              ),
            })
          )
        )
      );
      dispatch(tr);
    }

    return true;
  };
}
