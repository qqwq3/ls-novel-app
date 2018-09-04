
'use strict';

import React,{ Component, PureComponent } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import Immutable from 'immutable';
import _ from "loadsh";
import { connect } from 'react-redux';
import {Styles, ScaledSheet, BackgroundColor, Fonts} from "../../common/Style";
import Header from '../../components/Header';
import {height, timestampToTime, width, RefreshState, pixe, infoToast} from "../../common/Tool";
import CommentRows from '../../components/CommentRows';
import { reloadMyComments, loadMyComments, deleteUserComments } from "../../actions/User";
import NovelFlatList from '../../components/NovelFlatList';
import {moderateScale, scale, verticalScale} from "react-native-size-matters";
import DefaultDisplay from '../../components/DefaultDisplay';

type Props = {
    records: Array<any>,
    currentOffset: number,
    refreshState: number,
    totalRecords: number
};

class Comments extends Component<Props>{
    static defaultProps = {
        records: [],
        currentOffset: 0,
        refreshState: 0,
        totalRecords: 0,
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
            rightOpenValue: - (scale(75)),
            records: [],
            closeOnRowPress: false
        };
        this.deleteTime = Date.now();
        this.recordsTime = Date.now();
    }
    componentDidMount() {
        this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
    }
    componentWillReceiveProps(nextProps) {
        // 删除成功提示
        if(nextProps.deleteSingle && nextProps.deleteSingleTimeUpdate > this.deleteTime){
            const code = nextProps.deleteSingle.code;

            this.deleteTime = nextProps.deleteSingleTimeUpdate;

            if(parseInt(code) === 0){
                this.onHeaderRefresh && this.onHeaderRefresh(RefreshState.HeaderRefreshing);
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
                title={'我的书评'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    renderItemBooks({item, index}){
        return (
            <CommentRows
                isFabulous={false}
                showFaces={false}
                userName={item.title}
                contentText={item.content}
                commentTime={timestampToTime(item.timeCreated)}
                pointPraise={item.likeCount}
            />
        );
    }
    // 头部刷新 - function
    onHeaderRefresh(refreshState){
        const { reloadMyComments } = this.props;
        reloadMyComments && reloadMyComments(refreshState, 0);
    }
    // 底部加载 - function
    onFooterRefresh(refreshState){
        const { loadMyComments, currentOffset } = this.props;
        const records = this.props.records ? this.props.records : [];

        loadMyComments && loadMyComments(refreshState, currentOffset, records);
    }
    // 内容 - demo
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
                renderItem={this.renderItemBooks.bind(this)}
                keyExtractor={(item, index) => index + ''}
                onHeaderRefresh={this.onHeaderRefresh.bind(this)}
                onFooterRefresh={this.onFooterRefresh.bind(this)}
                refreshState={refreshState}
                totalRecords={totalRecords}
                offset={ currentOffset }
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
    _deleteSingle(item, index, rowMap){
        const { records } = this.state;
        const id = item.id || 0;

        rowMap[index].closeRow();
        _.pullAllWith(records, [records[index]], _.isEqual);
        this.setState({records: records, closeOnRowPress: true});
        this.props.deleteUserComments && this.props.deleteUserComments(id);
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
    separator: {
        backgroundColor: '#E5E5E5',
        width: '100%',
    },
    deleteButton:{
        backgroundColor: 'red',
        flex: 1,
        position: 'relative',
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: moderateScale(20),
    },
    deleteButtonText: {
        fontSize: '15@ms',
        color: BackgroundColor.bg_fff,
    },
});

const mapStateToProps = (state, ownProps) => {
    let userData = state.getIn(['user', 'userData','commentsData']);
    let deleteCommontsData = state.getIn(['user','userData','deleteComments']);

    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    if(Immutable.Map.isMap(deleteCommontsData)){ deleteCommontsData = deleteCommontsData.toJS() }
    return { ...ownProps, ...userData, ...deleteCommontsData };
};

export default connect(mapStateToProps,{
    reloadMyComments, loadMyComments,
    deleteUserComments
})(Comments);


