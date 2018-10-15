import React from 'react';
import { observer } from 'mobx-react';

const Task = observer(props => {
  const { state, task, children, provideKey='state' } = props;
  if(task && task.state === state) {
    if(typeof children === 'function') return children(task[provideKey]);
    return children;
  } else {
    return null;
  }
});

export const Pending = props => (<Task {...props} state="pending"/>);
export const Resolved = props => (<Task {...props} state="resolved" provideKey="result"/>);
export const Rejected = props => (<Task {...props} state="rejected" provideKey="error"/>);
export default Task;
