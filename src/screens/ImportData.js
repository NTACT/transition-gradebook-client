import React, { Component } from 'react';
import { observable, computed, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Screen from '../components/Screen';


@withRouter
@inject('store')
@observer
class ImportData extends Component {

    render() {
        return (
            <Screen>

            </Screen>
        );
    }
}

export default ImportData;