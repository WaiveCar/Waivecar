import React               from 'react';
import update              from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend        from 'react-dnd/modules/backends/HTML5';
import ViewContainer       from './view-container';
import Item                from './item';
import ItemCategories      from './item-categories';
import { components }      from 'reach-ui';

@DragDropContext(HTML5Backend)
export default class ViewLayout extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      layout : {
        type       : 'Container',
        category   : ItemCategories.CONTAINER,
        accepts    : [ ItemCategories.ROW, ItemCategories.COMPONENT ],
        components : null
      },
      items : [
        { name : 'Row',    type : 'row',     icon : 'border_horizontal', category : ItemCategories.ROW,       accepts : [ ItemCategories.COLUMN ],                        options : {} },
        { name : 'Column', type : 'column',  icon : 'border_vertical',   category : ItemCategories.COLUMN,    accepts : [ ItemCategories.ROW, ItemCategories.COMPONENT ], options : {} }
      ].concat(components.getAll()),
      lastDroppedItem : null
    };
  }

  render() {
    const { layout, items, lastDroppedItem } = this.state;

    return (
      <div className="view-layout">
        <ViewContainer
          key             = { 'container' }
          type            = { layout.type }
          category        = { layout.category }
          components      = { layout.components }
          accepts         = { layout.accepts }
          lastDroppedItem = { lastDroppedItem }
          onDrop          = { this.handleDrop.bind(this) }
        />
        <div className="temp-foot">{ JSON.stringify(this.state.layout) }</div>
        <div className="pinned-right">
          <ul className="list-group">
          {
            items.map((item, index) =>
              <li className="list-group-item" key={ index }>
                <Item
                  key      = { index }
                  id       = { `item-${ index }`}
                  name     = { item.name }
                  type     = { item.type }
                  icon     = { item.icon }
                  category = { item.category }
                  accepts  = { item.accepts }
                  options  = { item.options }
                />
              </li>
            )
          }
          </ul>
        </div>
      </div>
    );
  }

  handleDrop(item) {
    const { id, type, category, components, lastDroppedItem } = item;
    let layout = this.state.layout;
    if (!layout.components) {
      if (item.category === ItemCategories.COMPONENT) {
        layout.components = item;
      } else {
        layout.components = [ item ];
      }
    } else {
      let existing = layout.components.find(l => l.id === item.id);
      if (existing) {
        existing = item;
      } else {
        layout.components.push(item);
      }
    }

    this.setState({
      layout : layout,
      lastDroppedItem: item
    });
  }
}