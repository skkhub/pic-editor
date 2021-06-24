import React, {Component} from 'react';

class CarouselItem extends Component {

    render() {
        return (
            <div style={{width: '100%', flexShrink: 0}} >
                {this.props.children}
            </div>
        );
    }
}

export default CarouselItem;