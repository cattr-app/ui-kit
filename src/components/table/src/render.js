/**
 * Functional cell renderer for columns with a `render` function.
 * The column's render receives `{ item, column, index }` (index = row index) and returns a VNode;
 * `h` is imported from 'vue' by the consumer.
 */
const Cell = props =>
  props.render({
    item: props.item,
    column: props.column,
    index: props.index,
  })

Cell.props = {
  item: Object,
  column: Object,
  index: Number,
  render: Function,
}

export default Cell
