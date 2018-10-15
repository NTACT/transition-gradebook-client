/*
  Passes breakpoint changes to the wrapped component.
  The wrapped component must be a mobx observer.
  The `breakpoints` prop passed to wrapped component looks like this:
  {
    small: true,
    medium: false,
    large: false,
    ... any other breakpoints defined in breakpoints.js
  }
*/

import React, { Component } from 'react';
import * as breakpoints from '../breakpoints';
import { observable } from 'mobx';

export default function responsive(Wrapped) {
  return class Responsive extends Component {
    @observable breakpoints = Object.keys(breakpoints).reduce((bps, key) => {
      bps[key] = false;
      return bps;
    }, {});

    constructor(props) {
      super(props);
      this._queryList = Object.entries(breakpoints).map(([key, breakpoint]) => {
        const query = window.matchMedia(breakpoint);
        query._key = key;
        query.addListener(this.computeBreakpointMatches);
        return query;
      });
      this.computeBreakpointMatches();
    }

    computeBreakpointMatches = () => {
      const { breakpoints } = this;
      for(let query of this._queryList) {
        breakpoints[query._key] = query.matches;
      }
    };

    componentWillUnmount() {
      this._queryList.forEach(q => q.removeListener(this.computeBreakpointMatches));
    }

    render() {
      return (<Wrapped {...this.props} breakpoints={this.breakpoints}/>);
    }
  };
}
