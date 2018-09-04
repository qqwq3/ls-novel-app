
'use strict';

import React, { Component, PureComponent } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import Immutable from 'immutable';
import _ from 'loadsh';
import { connect } from 'react-redux';
import { SwipeRow } from 'react-native-swipe-list-view';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet, Fonts, Colors, BackgroundColor } from "../../common/Style";
import Header from '../../components/Header';
import Books from '../../components/Books';
import { pixel, loadImage, height, width, infoToast, RefreshState } from "../../common/Tool";
import { reloadHistorical, loadHistorical, deleteUserHistorical } from "../../actions/User";
import NovelFlatList from '../../components/NovelFlatList';
import DefaultDisplay from '../../components/DefaultDisplay';

type Props = {
    records: Array<any>,
    currentOffset: number,
    refreshState: number,
    totalRecords: number
};

class Historical extends Component<Props>{
    static defaultProps = {
        records: [],
        currentOffset: 0,
        refreshState: 0,
        totalRecords: 0,
    };
    constructor(props){
        super(props);
        this._rows = {};
        this.state = {
            currentIndex: 0,
            rightOpenValue: - (scale(75) + moderateScale(15)),
            records: [],
            closeOnRowPress: false
        };
        this.errorTiem = Date.now();
        this.deleteTime = Date.now();
        this.recordsTime = Date.now();
    }
    componentDidMount(){
        this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps){
        // 出错提示
        if(nextProps.error && nextProps.error.timeUpdated > this.errorTiem){
            const message = nextProps.error.message || '';

            this.errorTiem = nextProps.error.timeUpdated;
            infoToast && infoToast(message);
        }

        // 删除成功提示
        if(nextProps.deleteSingle && nextProps.deleteSingleTimeUpdate > this.deleteTime){
            const code = nextProps.deleteSingle.code;

            this.deleteTime = nextProps.deleteSingleTimeUpdate;

            if(parseInt(code) === 0){
                this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing, 0);
                infoToast && infoToast('删除成功');
            }
        }

        // 把数据放到 state - records 里面去
        if(nextProps.records && nextProps.updateTime > this.recordsTime){
            this.recordsTime = nextProps.updateTime;
            this.setState({records: nextProps.records});
        }
    }
    // 返回 - function
    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }
    // 头部 - demo
    renderHeader(){
        return (
            <Header
                title={'阅读记录'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const {  reloadHistorical } = this.props;
        reloadHistorical && reloadHistorical(refreshState, 0);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { loadHistorical, currentOffset } = this.props;
        const records = this.props.records ? this.props.records : [];
        loadHistorical && loadHistorical(refreshState, currentOffset, records);
    }
    // 内容 - demo
    renderItem({item, index}){
        const textStyles = [ Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080 ];
        const uri = loadImage(item.bookId);
        const DeleteButton = () => {
            return (
                <TouchableOpacity
                    style={[styles.deleteButton]}
                    activeOpacity={1}
                    onPress={this._deleteSingle.bind(this, item, index)}
                >
                    <Text style={[styles.deleteButtonText, Fonts.fontFamily]}>删除</Text>
                </TouchableOpacity>
            );
        };

        return (
            <View key={index} style={[{
                backgroundColor: BackgroundColor.bg_fff,
                zIndex: 100,
                position: 'relative'
            }]}>
                <View style={[
                    styles.BookMarkBox,
                    styles.menuInnerBottomBorder,
                    {
                        borderBottomWidth: scale(1 / pixel),
                    }
                ]}>
                    <Books source={{uri: uri}} clickAble={false} size={'large'}/>
                    <View style={styles.BookMarkMassage}>
                        <Text style={[styles.BookMarkTitle, Fonts.fontFamily, Fonts.fontSize15]} numberOfLines={1}>{ item.bookTitle }</Text>
                        <View style={[styles.BookMarkNew]}>
                            <Text style={textStyles} numberOfLines={1}>{ item.authorName }</Text>
                        </View>
                        <View style={[styles.BookMarkNew, {alignItems:'flex-end'}]}>
                            <Text style={textStyles} numberOfLines={1}>已读至 { item.chapterTitle }</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={[styles.continueButs, Styles.paddingRight15]}
                        onPress={this._continueReader.bind(this, item)}
                    >
                        <View style={[styles.buts, {borderColor: BackgroundColor.bg_f3916b}, Styles.flexCenter]}>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize12, Colors.orange_f3916b]}>继续阅读</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    // 删除单本书记录 - function
    _deleteSingle(item, index, rowMap){
        const bookIdHex = item.bookIdHex || '';
        const { records } = this.state;

        rowMap[index].closeRow();
        _.pullAllWith(records, [records[index]], _.isEqual);
        this.setState({records: records, closeOnRowPress: true});

        this.props.deleteUserHistorical && this.props.deleteUserHistorical(bookIdHex);
    }
    // 继续阅读 - function
    _continueReader(item){
        const { navigation } = this.props;
        const hexId = item.bookIdHex;
        const bookId = item.bookId;
        const bookHexId = item.bookIdHex;
        const chapterHexId = `book_id${hexId}`;

        // const sourceSiteIndex = item.sourceSiteIndex;
        // const vipChapterIndex = item.vipChapterIndex;
        // const value = parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex) ? '1' : '0';

        // navigation && navigation.navigate('Reader',{ hexId, bookId, bookHexId, direct: true});

        navigation && navigation.navigate('Reader',{
            chapterHexId,
            bookHexId,
            bookId
        });
    }
    renderContent(){
        const { currentOffset, refreshState, totalRecords, records } = this.props;
        const _height =  height - (StatusBar.currentHeight + verticalScale(44));

        return (
            <NovelFlatList
                showArrow={true}
                data={this.state.records}
                ListEmptyComponent={
                    <View style={[{height: _height, width: width}]}>
                        <DefaultDisplay />
                    </View>
                }
                renderItem={this.renderItem.bind(this)}
                keyExtractor={(item,index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                totalRecords={totalRecords}
                offset={currentOffset}
                swipeFlatList={true}
                renderHiddenItem={this.renderHiddenItem.bind(this)}
                disableRightSwipe={true}
                rightOpenValue={this.state.rightOpenValue}
                closeOnRowPress={true}
            />
        );
    }
    renderHiddenItem({item, index}, rowMap){
        return (
            <TouchableOpacity
                style={[styles.deleteButton]}
                activeOpacity={1}
                onPress={this._deleteSingle.bind(this, item, index, rowMap)}
            >
                <Text style={[styles.deleteButtonText, Fonts.fontFamily]}>删除</Text>
            </TouchableOpacity>
        );
    }
    render(){
        return (
            <View style={[Styles.container, {backgroundColor: BackgroundColor.bg_fff}]}>
                { this.renderHeader() }
                { this.renderContent() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
    swipeOut:{
        backgroundColor: BackgroundColor.bg_fff,
    },
    deleteButton:{
        backgroundColor: 'red',
        flex: 1,
        position: 'relative',
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: moderateScale(30),
    },
    deleteButtonText: {
        fontSize: '15@ms',
        color: BackgroundColor.bg_fff,
    },
    continueButs: {
        zIndex: 1,
        backgroundColor: 'transparent',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buts: {
        height: "25@vs",
        width: '80@s',
        borderWidth: 1,
        borderRadius: '50@ms',
    },
    BookMarkNew: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginRight: '15@ms',
        height: '25@vs',
        alignItems: 'center',
        overflow: 'hidden',
    },
    BookMarkTitle: {
        color: '#4C4C4C',
        flex: 2
    },
    BookMarkMassage: {
        flex: 1,
        marginLeft: '15@ms',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    BookMarkBox: {
        marginLeft: '15@ms',
        paddingTop: '15@ms',
        paddingBottom: '15@ms',
        flexDirection: 'row',
        position: 'relative',
    },
    menuInnerBottomBorder: {
        borderBottomColor: '#E5E5E5',
        borderStyle: 'solid',
    },
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user', 'userData','historicalData']);
    let deleteHistoricalData = state.getIn(['user','userData','deleteHistorical']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    if(Immutable.Map.isMap(deleteHistoricalData)){ deleteHistoricalData = deleteHistoricalData.toJS() }
    return { ...ownProps, ...userData, ...deleteHistoricalData };
};
export default connect(mapStateToProps,{
    reloadHistorical, loadHistorical,
    deleteUserHistorical
})(Historical);

