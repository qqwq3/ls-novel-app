'use strict';

import React, { Component } from 'react';
import { StackActions, NavigationActions } from 'react-navigation';
import { infoToast } from "../common/Tool";
import { removeUserSession } from "../common/Storage";

export default class BaseComponent extends Component {
    constructor(props){
        super(props);
        this.errTime = Date.now();
    }
    componentWillReceiveProps(nextProps) {
        let curData = this.getData(this.props);
        let nextData = this.getData(nextProps);

        if (!curData || !nextData) {
            return;
        }

        let showError = false;
        let nextPropsError = nextData.error;

        if (nextPropsError && curData.error) {
            if (nextPropsError.code !== curData.error.code) {
                showError = true;
            }
        }
        else if (nextPropsError) {
            if(nextPropsError.timeUpdated && nextPropsError.timeUpdated > this.errTime) {
                this.errTime = Date.now();
                showError = true;
            }
        }

        if (showError && this.ignoreErrorCodes().indexOf(nextData.error.code) == -1) {
            if (parseInt(nextData.error.code) === 401) {
                if(this.isRedirect401()) {
                    return this.logIn();
                }

                // 清除用户信息 - 本地
                removeUserSession && removeUserSession();

                // 清除redux相关的缓存
                global.persistStore && global.persistStore.purge();

                let errorPrompt = this.props.authorizedKey ? nextData.error.message : '请先登录';

                return infoToast && infoToast(errorPrompt);
            }

            // 显示错误
            infoToast && infoToast(nextData.error.message);
        }

    }
    isAuthorized() {
        return this.props.authorizedKey;
    }
    /***
     * 遇到401时，是否重定向到登录页
     * @returns {boolean}
     */
    isRedirect401() {
        return false;
    }
    ignoreErrorCodes() {
        return [];
    }
    getData(props) {
        return props;
    }
    logIn = () => {
        this.props.navigation && this.props.navigation.navigate('logIn');
    };
    newNavigate = (routeName: string, params: Object = {}, subRouteName?: string, subParams?: Object = {}) => {
        const navigateAction = NavigationActions.navigate({
            routeName: routeName,
            params: params,
            action: NavigationActions.navigate({
                routeName: subRouteName,
                params: subParams
            }),
        });

        this.props.navigation && this.props.navigation.dispatch(navigateAction);
    };
    backNavigate = (key: string) => {
        const backAction = NavigationActions.back({key});

        this.props.navigation && this.props.navigation.dispatch(backAction);
    };
    setParamsNavigate = (params: Object = {}, key: string) => {
        const setParamsAction = NavigationActions.setParams({
            params,
            key
        });

        this.props.navigation && this.props.navigation.dispatch(setParamsAction);
    };
    replaceNavigate = (routeName: string, params: Object = {}) => {
        const replaceAction = StackActions.replace({
            routeName, params
        });

        this.props.navigation && this.props.navigation.dispatch(replaceAction);
    };
    resetNavigate = (routeName: string, params: Object = {}) => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName, params })],
        });

        this.props.navigation && this.props.navigation.dispatch(resetAction);
    };
    pushNavigate = (routeName: string, params: Object = {}) => {
        const pushAction = StackActions.push({
            routeName,
            params
        });

        this.props.navigation && this.props.navigation.dispatch(pushAction);
    };
    popNavigate = (value: number = 1) => {
        const popAction = StackActions.pop({
            n: value,
        });

        this.props.navigation && this.props.navigation.dispatch(popAction);
    };
    popToTopNavigate = () => {
        const popToTopAction = StackActions.popToTop();

        this.props.navigation && this.props.navigation.dispatch(popToTopAction);
    };
}
