import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

interface DraggableModifierArgs {
  index: number;
  draggingClass: string;
}
const draggableModifier = ({ index, draggingClass }: DraggableModifierArgs) => {
  return modifier((element: HTMLElement) => {
    element.setAttribute('draggable', 'true');

    const dragStartListener = (event: DragEvent) => {
      event.dataTransfer?.setData(
        'application/json',
        JSON.stringify({ index }),
      );
      element.classList.add(draggingClass);
    };
    element.addEventListener('dragstart', dragStartListener);

    const dragEndListener = () => {
      element.classList.remove(draggingClass);
    };
    element.addEventListener('dragend', dragEndListener);
    return () => {
      element.removeEventListener('dragstart', dragStartListener);
      element.removeEventListener('dragend', dragEndListener);
    };
  });
};
interface DropzoneModifierArgs {
  index: number;
  dragoverClass: string;
  items: unknown[];
  onSort: (items: unknown[]) => void;
}
const dropzoneModifier = ({
  index,
  dragoverClass,
  items,
  onSort,
}: DropzoneModifierArgs) => {
  return modifier((element: HTMLElement) => {
    const dragEnterHandler = (event: DragEvent) => {
      event.preventDefault();
      element.classList.add(dragoverClass);
    };
    element.addEventListener('dragenter', dragEnterHandler);

    const dragLeaveHandler = (event: DragEvent) => {
      event.preventDefault();
      element.classList.remove(dragoverClass);
    };
    element.addEventListener('dragleave', dragLeaveHandler);

    const dragOverHandler = (event: DragEvent) => {
      event.preventDefault();
    };
    element.addEventListener('dragover', dragOverHandler);

    const dropHandler = (event: DragEvent) => {
      event.preventDefault();
      element.classList.remove(dragoverClass);
      const jsonData = event.dataTransfer?.getData('application/json');
      if (jsonData) {
        const data = JSON.parse(jsonData);
        const itemIndex: number = data.index;
        const newItems = [...items];
        const [movedItem] = newItems.splice(itemIndex, 1);
        newItems.splice(index, 0, movedItem);

        onSort(newItems);
      }
    };
    element.addEventListener('drop', dropHandler);

    return () => {
      element.removeEventListener('drop', dropHandler);
      element.removeEventListener('dragover', dragOverHandler);
      element.removeEventListener('dragenter', dragEnterHandler);
      element.removeEventListener('dragleave', dragLeaveHandler);
    };
  });
};

interface SortableGroupSig {
  Args: {
    items: unknown[];
    onSort: (items: unknown[]) => void;
    dragoverClass?: string;
    draggingClass?: string;
  };
  Blocks: {
    default: [
      unknown,
      ReturnType<typeof draggableModifier>,
      ReturnType<typeof dropzoneModifier>,
    ];
  };
}
export default class SortableGroup extends Component<SortableGroupSig> {
  get dragoverClass() {
    return this.args.dragoverClass ?? 'dragover';
  }
  get draggingClass() {
    return this.args.draggingClass ?? 'is-dragging';
  }
  draggable = (index: number) => {
    return draggableModifier({ index, draggingClass: this.draggingClass });
  };
  dropzone = (index: number) => {
    return dropzoneModifier({
      index,
      dragoverClass: this.dragoverClass,
      items: this.args.items,
      onSort: this.args.onSort,
    });
  };
  <template>
    {{#each @items as |item index|}}
      {{yield item (this.draggable index) (this.dropzone index)}}
    {{/each}}
  </template>
}
