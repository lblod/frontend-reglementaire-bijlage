import { v4 as uuid } from 'uuid';

export default function insertTitle(intl) {
  return function (state, dispatch) {
    const { schema } = state;
    console.log(state.doc.canReplaceWith(0, 0, schema.nodes.document_title));
    if (!state.doc.canReplaceWith(0, 0, schema.nodes.document_title)) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr;
      tr.insert(
        0,
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
