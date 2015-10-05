'use strict';

import React      from 'react';
import { logger } from 'reach-react';
import { type }   from 'reach-react/lib/helpers';

// ### Form Components

import Input       from './input';
import Select      from './select';
import Checkbox    from './checkbox';
import Radio       from './radio';
import Textarea    from './textarea';
import ReactSelect from './react-select';

/**
 * @class FormGroup
 */
export default class FormGroup extends React.Component {

  /**
   * @method prepare
   * @param  {Mixed} data
   * @return {Component}
   */
  prepare(data) {
    if (type.isArray(data)) {
      return this.group(data.map((options, index) => {
        return this.field(options, index);
      }.bind(this)));
    }
    switch (data.component) {
      case 'input' : case 'select' : case 'multi-select' : case 'react-select' : case 'react-multi-select' : case 'textarea' :
        return this.group(this.field(data));
      default :
        return this.field(data);
    }
  }

  /**
   * @method group
   * @param  {Mixed} content
   * @return {Component}
   */
  group(content) {
    return (
      <div className="form-group row">
        { content }
      </div>
    );
  }

  /**
   * @method field
   * @param  {Object} options
   * @param  {Number} [index]
   * @return {Component}
   */
  field(options, index) {
    switch (options.component) {
      case 'input'              : return <Input       key={ index } options={ options } value={ this.props.data[options.name] } onChange={ this.props.onChange } />;
      case 'select'             : return <Select      key={ index } options={ options } value={ this.props.data[options.name] } onChange={ this.props.onChange } multi={ false } />;
      case 'multi-select'       : return <Select      key={ index } options={ options } value={ this.props.data }               onChange={ this.props.onChange } multi={ true } />;
      case 'checkbox'           : return <Checkbox    key={ index } options={ options } value={ this.props.data }               onChange={ this.props.onChange } />;
      case 'radio'              : return <Radio       key={ index } options={ options } value={ this.props.data[options.name] } onChange={ this.props.onChange } />;
      case 'textarea'           : return <Textarea    key={ index } options={ options } value={ this.props.data[options.name] } onChange={ this.props.onChange } />;
      case 'react-select'       : return <ReactSelect key={ index } options={ options } value={ this.props.data[options.name] } onChange={ this.props.onChange } multi={ false } />;
      case 'react-multi-select' : return <ReactSelect key={ index } options={ options } value={ this.props.data }               onChange={ this.props.onChange } multi={ true } />;
      default :
        logger.warn(`Form > Cannot render unknown component [${ options.component }]`);
    }
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    return this.prepare(this.props.field);
  }

}