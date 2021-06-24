/**
* @file index
* @author sunkeke
* @date 2020-12-11
*/

import React, {Component} from 'react';
import style from './index.module.less';

export default class Layout extends Component {

    render() {
        return (
            <div className={style.container}>
                {/* <button className={style['btn-close'] + ' icon-close'}></button> */}
                {/* <h3 className={style.title}>{this.props.title}</h3> */}
                <div className={style.main}>
                    <div className={style.left}>
                        {this.props.left}
                    </div>
                    <div className={style.right}>
                        {this.props.right}
                        <div className={style.footer}>
                            {this.props.footer}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
