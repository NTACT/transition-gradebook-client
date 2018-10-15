import React from 'react';

export default function filterChildren(children, fn) {
  const results = [];
  React.Children.forEach(children, (child, i) => {
    if(fn(child, i)) results.push(child);
  });
  return results;
}