'use strict';

import React,{ Component } from 'react';
import {View, Dimensions,Image,StyleSheet,TouchableOpacity,Text} from 'react-native';
import BaseComponent from "../../components/BaseComponent";
import {agent, arrow} from "../../common/Icons";
import Header from '../../components/Header';
import {setStatusBar} from "../../common/Tool";
import { moderateScale,scale,verticalScale } from 'react-native-size-matters';
import { commonShare, shareAddListener, shareRemoveListener } from "../../common/WxShare";
import {BackgroundColor, Colors, Fonts, ScaledSheet} from "../../common/Style";
import {localShare, VipData} from "../../actions/User";
import {connect} from "react-redux";
import Immutable from "immutable";
import Toast from "react-native-root-toast";
class ShareBookCurrency extends BaseComponent<Props>{
    constructor(props){
        super(props);
    }
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    componentWillMount(){
        setStatusBar && setStatusBar(BackgroundColor.bg_transparent, false,'light-content');
    }
    componentWillReceiveProps(nextProps) {
        console.log('share', nextProps);
        if(nextProps.code === 0){
            Toast.show(nextProps.message,{duration: 2000, position: -55})
        }
    }
    componentWillUnmount() {
        setStatusBar && setStatusBar(BackgroundColor.bg_fff, false,'dark-content');
    }
    //分享到微信群
    shareVxFlock(){
        const shareUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.shareUrl || 'http://share.lameixisi.cn';
        const agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        const channelID = global.launchSettings && global.launchSettings.channelID;

        shareRemoveListener && shareRemoveListener();
        commonShare && commonShare('friends', channelID, shareUrl, agentTag);
        shareAddListener && shareAddListener(_ => {
            this.props.localShare && this.props.localShare();
        });
    }
    //分享到朋友圈
    shareVxCircle(){
        const shareUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.shareUrl || 'http://share.lameixisi.cn';
        const agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';
        const channelID = global.launchSettings && global.launchSettings.channelID;

        shareRemoveListener && shareRemoveListener();
        commonShare && commonShare('friendsCircle', channelID, shareUrl, agentTag);
        shareAddListener && shareAddListener(_ => {
            this.props.localShare && this.props.localShare();
        });
    }
    renderHeader(){
        return (
            <View style={{position:'absolute',top:moderateScale(30),left:moderateScale(15),zIndex:10}}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._goBack.bind(this)}
                >
                    <View style={{width:scale(50),height:verticalScale(25)}}>
                        <Image source={arrow.leftWhite}/>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    render(){
        let ScreenWidth = Dimensions.get('window').width;
        const _uri = 'http://novel-res.oss-cn-hangzhou.aliyuncs.com/share/images/vip_share2.png';
        return(
        <View>
            {this.renderHeader()}
            <View style={{width:ScreenWidth,height:'100%'}}>
                <Image source={{uri:_uri}} resizeMode={'stretch'} style={{width:ScreenWidth,height:'100%'}}/>
                <View style={{alignItems:'center'}}>
                    <View style={{position:'absolute',bottom:moderateScale(130),width:scale(230),height:verticalScale(70)}}>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={this.shareVxFlock.bind(this)}
                        >
                            <Image
                                source={agent.shareVx}
                                resizeMode={'contain'}
                                style={{width:scale(230),height:verticalScale(60)}}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={this.shareVxCircle.bind(this)}
                        >
                            <Image
                                source={agent.shareFriends}
                                resizeMode={'contain'}
                                style={{width:scale(230),height:verticalScale(60)}}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    let share = state.getIn(['user','userData','share']);

    if(Immutable.Map.isMap(share)){ share = share.toJS() }
    return { ...ownProps, ...share };
};

export default connect(mapStateToProps,{localShare})(ShareBookCurrency);