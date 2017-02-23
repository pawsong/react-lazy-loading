import * as hoistStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { Component, ComponentClass, createElement, StatelessComponent } from 'react';

// tslint:disable-next-line variable-name
function getDisplayName(WrappedComponent: any) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export interface LazyOptions<P> {
  isLoading: (props: P) => boolean;
  isFailed?: (props: P) => boolean;
  renderLoading?: (props: P) => JSX.Element | null,
  renderFailed?: (props: P) => JSX.Element | null,
}

function lazy<P>({ isLoading, isFailed, renderLoading, renderFailed }: LazyOptions<P>) {
  return (WrappedComponent: ComponentClass<P> | StatelessComponent<P>) => {
    class LazyLoaded extends Component<P, any> {
      rendered: boolean;

      constructor(props: P) {
        super(props);
        this.rendered = false;
      }

      render() {
        if (!this.rendered) {
          if (isFailed && isFailed(this.props)) {
            return renderFailed ? renderFailed(this.props) : null;
          }

          if (isLoading(this.props)) {
            return renderLoading ? renderLoading(this.props) : null;
          }

          this.rendered = true;
        }

        return createElement(WrappedComponent as any, this.props);
      }
    }

    (LazyLoaded as any).WrappedComponent = WrappedComponent;
    (LazyLoaded as any).displayName = `LazyLoaded(${getDisplayName(WrappedComponent)})`;

    return hoistStatics(LazyLoaded, WrappedComponent);
  }
}

export default lazy;
