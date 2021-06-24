import React, {Component} from 'react';
import style from './index.module.less';
import CarouselItem from './item';

class Carousel extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            // items: [],
            current: 0,
            translateX: 0
        };
    }

    go = step => {
        const children = React.Children.map(this.props.children, child => child);
        let len = children.filter(item => item.type === CarouselItem).length;
        let current = step < 0 ? len - 1 : step >= len ? 0 : step;
        this.setState({
            current,
            translateX: -100 * current
        });
    }

    render() {
        const children = React.Children.map(this.props.children, child => child).filter(child => child.type === CarouselItem);
        return (
            <div className={this.props.className + ' ' + style.container} >
                <div className={style['hidden-layer']}>
                    <div className={style.wrapper} style={{transform: `translateX(${this.state.translateX}%)`}}>
                        {
                            children
                        }
                    </div>
                </div>
                <i className={style.left} onClick={this.go.bind(this, this.state.current - 1)}>
                    <svg width="5px" height="8px" viewBox="0 0 5 8" version="1.1">
                        <title>三角形</title>
                        <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="封面编辑ui" transform="translate(-528.000000, -498.000000)" fill="#C3C3C3">
                                <g id="编组-78" transform="translate(215.000000, 247.000000)">
                                    <g id="模板区" transform="translate(73.000000, 65.000000)">
                                        <g id="编组-5" transform="translate(5.857143, 104.000000)">
                                            <path d="M237.819232,84.3131885 L239.898576,87.2836805 C240.215291,87.7361298 240.105256,88.3596603 239.652807,88.6763748 C239.484723,88.7940333 239.284517,88.8571429 239.079344,88.8571429 L234.920656,88.8571429 C234.368371,88.8571429 233.920656,88.4094276 233.920656,87.8571429 C233.920656,87.6519708 233.983765,87.451764 234.101424,87.2836805 L236.180768,84.3131885 C236.497483,83.8607392 237.121013,83.7507044 237.573462,84.0674189 C237.669104,84.1343678 237.752283,84.2175471 237.819232,84.3131885 Z" id="三角形" transform="translate(237.000000, 86.000000) rotate(-270.000000) translate(-237.000000, -86.000000) "></path>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </i>
                <i className={style.right} onClick={this.go.bind(this, this.state.current + 1)}>
                    <svg width="5px" height="8px" viewBox="0 0 5 8" version="1.1">
                        <title>三角形</title>
                        <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="封面编辑ui" transform="translate(-528.000000, -498.000000)" fill="#C3C3C3">
                                <g id="编组-78" transform="translate(215.000000, 247.000000)">
                                    <g id="模板区" transform="translate(73.000000, 65.000000)">
                                        <g id="编组-5" transform="translate(5.857143, 104.000000)">
                                            <path d="M237.819232,84.3131885 L239.898576,87.2836805 C240.215291,87.7361298 240.105256,88.3596603 239.652807,88.6763748 C239.484723,88.7940333 239.284517,88.8571429 239.079344,88.8571429 L234.920656,88.8571429 C234.368371,88.8571429 233.920656,88.4094276 233.920656,87.8571429 C233.920656,87.6519708 233.983765,87.451764 234.101424,87.2836805 L236.180768,84.3131885 C236.497483,83.8607392 237.121013,83.7507044 237.573462,84.0674189 C237.669104,84.1343678 237.752283,84.2175471 237.819232,84.3131885 Z" id="三角形" transform="translate(237.000000, 86.000000) rotate(-270.000000) translate(-237.000000, -86.000000) "></path>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </i>
                <ul className={style.pagination}>{
                    children.map((child, i) => 
                        (<li
                            className={this.state.current === i ? style.active : ''}
                            onClick={this.go.bind(this, i)}
                            key={i}
                        ></li>)
                    )
                }</ul>
            </div>
        );
    }
}

export default Carousel;