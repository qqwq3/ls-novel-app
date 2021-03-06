
'use strict';

import React,{ Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, Image, StatusBar
} from 'react-native';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import _ from 'loadsh';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {
    Styles, ScaledSheet, Fonts,
    Colors, BackgroundColor, Img
} from "../../common/Style";
import {
    pixel, width,
    RefreshState, statusBarSet,
    infoToast, height
} from "../../common/Tool";
import {
    reloadChapterDirectory, loadChapterDirectory,
    reloadBookMark, loadBookMark
} from '../../actions/CatalogDirectory';
import chapterDirectory from "../../reducers/ChapterDirectory";
import NovelFlatList from '../../components/NovelFlatList';
import Header from '../../components/Header';
import { readerImg } from "../../common/Icons";
import BaseComponent from '../../components/BaseComponent';
import { updateChapter } from '../../actions/LocalAction';
import { fineCommonRemoveSingle } from '../../common/Storage';
import ChapterPartition from '../../common/ChapterPartition';

type Props = {
    chapter?: Object
};

type State = {};

class ChapterDirectory extends BaseComponent<Props, State>{
    static defaultProps = {
        chapter: {},
    };
    constructor(props){
        super(props);
        this.state = {
            currentIndex: 0,
            currentChapterHexId: null,
            title: null,
            page: 1,
            visible: false,
            active: false,
            startIndex: 0,
            endIndex: 0,
            startIndexArr: [],
            endIndexArr: [],
            totalPage: 0,
            records: [],
        };
        this.errorTime = Date.now();
        this.chapterTime = Date.now();
        this.directoryTime = Date.now();
    }
    componentDidMount() {
        const { navigation, chapter } = this.props;
        const type = navigation.getParam('type');

        if(type === 'bookmark'){
           // this.onHeaderRefreshBookmark && this.onHeaderRefreshBookmark(RefreshState.HeaderRefreshing);
        }

        // type !== 'chapter' && statusBarSet && statusBarSet.barHide();

        this.onHeaderRefreshChapter && this.onHeaderRefreshChapter(RefreshState.HeaderRefreshing);

        if(chapter && Object.keys(chapter).length !== 0){
            this.setState({
                currentChapterHexId: chapter.content.length !== 0 ? chapter.content[chapter.index / width].currentChapterHexId : null,
                title: chapter.content.length !== 0 ? chapter.content[chapter.index / width].title : null,
            });
        }
    }
    componentWillUnmount() {
        const { navigation } = this.props;
        const type = navigation.getParam('type');

        //type === 'chapter' && statusBarSet && statusBarSet.barShow();
    }
    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);

        console.log('chapterDirectory.js',nextProps);

        if(nextProps.directory && nextProps.directory.updateTime > this.directoryTime){
            const totalRecords = nextProps.directory.totalRecords;
            const chapterNoTraverse = ChapterPartition.noTraverse(Number(totalRecords), this.state.page, 100);
            const records = nextProps.directory.chapters;

            this.directoryTime = nextProps.directory.updateTime;
            this.setState({
                startIndex: chapterNoTraverse.startIndex,
                endIndex: chapterNoTraverse.endIndex,
                records: records,
            });
        }

        // if(nextProps.chapter && nextProps.chapter.timeUpdated > this.chapterTime){
        //     this.chapterTime = nextProps.chapter.timeUpdated;
        //
        //     let content = nextProps.chapter.content;
        //     let index = nextProps.chapter.index;
        //
        //     this.setState({currentChapterHexId: content[index / width]});
        // }

        // if(nextProps.mark && nextProps.mark.error){
        //     if(nextProps.mark.error.timeUpdated > this.errorTime){
        //         this.errorTime = nextProps.mark.error.timeUpdated;
        //         //infoToast && infoToast(nextProps.mark.error.message, { duration: 2000, position: Toast.positions.CENTER });
        //     }
        // }
    }
    // 从章节去阅读 - function
    chapterReader(item, sourceSiteIndex, vipChapterIndex){
        const { navigation, updateChapter, directory } = this.props;
        const chapterHexId = item.hexId;
        const bookId = item.bookId;
        const bookHexId = directory && directory.book && directory.book.hexId;

        this.setState({currentChapterHexId: item.hexId});
        updateChapter && updateChapter(true);
        fineCommonRemoveSingle && fineCommonRemoveSingle('allBookCapter', bookHexId + 'currentChapter');

        navigation && navigation.navigate('Reader',{chapterHexId, bookHexId, bookId});
    }
    // 返回 - function
    _goBack() {
        const { navigation } = this.props;
        navigation && navigation.goBack();
        // navigation && navigation.pop();
    }
    // 头部 - demo
    renderHeader() {
        const { navigation } = this.props;
        const type = navigation.getParam('type');
        const title = navigation.getParam('title');

        return (
            <Header
                isTitleRight={false}
                title={type === 'chapter' ? title : ''}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }
    // 章节数据渲染 - demo
    renderItemChapter({item, index}){
        const { directory } = this.props;
        const book = directory ? directory.book : false;
        const vipChapterIndex = book ? book.vipChapterIndex : 0;
        const fontColor = this.state.currentChapterHexId === item.hexId ? Colors.orange_f3916b : Colors.gray_808080;

        return (
            <TouchableOpacity
                key={index}
                style={[styles.rcBodyRow]}
                activeOpacity={0.75}
                onPress={this.chapterReader.bind(this, item, parseInt(item.sourceSiteIndex), parseInt(vipChapterIndex))}
            >
                <Text
                    numberOfLines={1}
                    style={[Fonts.fontFamily, Fonts.fontSize14, fontColor, {maxWidth: width - scale(60)}]}
                >
                    { item.title }
                </Text>
                {
                    (parseInt(item.sourceSiteIndex) >= parseInt(vipChapterIndex) && parseInt(vipChapterIndex) !== 0)
                    ? <Image source={readerImg.rmb} style={[Img.resizeModeContain, styles.rmbImage]}/> : null
                }
            </TouchableOpacity>
        );

    }
    // 头部刷新 - 章节 - function
    onHeaderRefreshChapter(refreshState){
        const { reloadChapterDirectory, navigation } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');

        reloadChapterDirectory && reloadChapterDirectory(type, hexId, 0);
    }
    // 底部加载 - 章节 - function
    onFooterRefreshChapter(refreshState){
        const { loadChapterDirectory, directory, navigation } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');
        const currentOffset = directory ? directory.currentOffset : 0;

        loadChapterDirectory && loadChapterDirectory(type, hexId, currentOffset);
    }
    // 头部刷新 - 书签 - function
    onHeaderRefreshBookmark(refreshState){
        const { reloadBookMark, navigation } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');

        reloadBookMark && reloadBookMark(type, hexId, refreshState, 0);
    }
    // 底部加载 - 书签 - function
    onFooterRefreshBookmark(refreshState){
        const { loadBookMark , navigation, mark } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');
        const currentOffset = mark ? mark.currentOffset : 0;

        loadBookMark && loadBookMark(type, hexId, refreshState, currentOffset);
    }
    // 目录 - demo
    renderCatalog(){
        const { directory } = this.props;
        const currentOffset = directory ? directory.currentOffset : 0;
        const refreshState = directory ? directory.refreshState : 0;
        const totalRecords = directory ? directory.totalRecords : 0;
        // const records = directory ? directory.chapters : [];

        return (
            <View style={[styles.rcBody]} tabLabel={'目录'}>
                <NovelFlatList
                    showArrow={true}
                    data={this.state.records}
                    renderItem={this.renderItemChapter.bind(this)}
                    keyExtractor={(item, index) => index + ''}
                    onHeaderRefresh={this.onHeaderRefreshChapter.bind(this)}
                    onFooterRefresh={this.onFooterRefreshChapter.bind(this)}
                    refreshState={refreshState}
                    numColumns={1}
                    totalRecords={totalRecords}
                    offset={currentOffset}
                    contentContainerStyle={styles.contentContainerStyle}
                />
            </View>
        );
    }
    // 书签 - demo
    renderBookMark(){
        const { mark } = this.props;
        const currentOffset = mark ? mark.currentOffset : 0;
        const refreshState = mark ? mark.refreshState : 0;
        const totalRecords = mark ? mark.totalRecords : 0;
        const records = mark ? mark.records : [];

        return (
            <View style={[styles.rcBody]} tabLabel={'书签'}>
                {
                    !(mark && mark.error) ?
                    <NovelFlatList
                        data={records}
                        renderItem={this.renderItemBookmark.bind(this)}
                        keyExtractor={(item, index) => index + ''}
                        onHeaderRefresh={this.onHeaderRefreshBookmark.bind(this)}
                        onFooterRefresh={this.onFooterRefreshBookmark.bind(this)}
                        refreshState={refreshState}
                        numColumns={1}
                        totalRecords={totalRecords}
                        offset={currentOffset}
                        contentContainerStyle={styles.contentContainerStyle}
                    /> :
                    <View style={[Styles.flexCenter, Styles.flex1]}>
                        <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>
                            登录后查看书签
                        </Text>
                    </View>
                }

            </View>
        );
    }
    // 书签数据渲染 - demo
    renderItemBookmark({item, index}){
        const commonFontStyles = [Fonts.fontFamily, Fonts.fontSize12, Colors.gray_808080];

        return (
            <View style={styles.rcBodyContent}>
                <TouchableOpacity
                    style={[styles.rcBodyRow,{height: verticalScale(60), borderStyle:'solid'}]}
                    onPress={this.continueReader.bind(this, item)}
                    activeOpacity={1}
                >
                    <View style={styles.rcBodyRowLeft}>
                        <View>
                            <Text style={[Fonts.fontFamily, Fonts.fontSize14, Colors.gray_404040]}>{ item.bookTitle }</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <View style={{marginRight: moderateScale(5)}}>
                                <Text style={commonFontStyles}>已读至</Text>
                            </View>
                            <View style={{maxWidth:160}}>
                                <Text numberOfLines={1} style={commonFontStyles}>{ item.chapterTitle }</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.rcBodyRowBut, Styles.flexCenter]}>
                        <Text style={commonFontStyles}>继续阅读</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    // 继续阅读 - function
    continueReader(item){
        const { navigation } = this.props;
        const hexId = item.hexId;
        const bookId = item.bookId;
        const sourceSiteIndex = item.sourceSiteIndex;
        const vipChapterIndex = item.vipChapterIndex;
        const value = parseInt(sourceSiteIndex) >= parseInt(vipChapterIndex) ? '1' : '0';

        navigation && navigation.navigate('Reader',{ hexId, bookId, direct: true, value: value });
    }
    // 当前章节标题 - demo
    renderCurrentChapter(){
        if(!this.state.currentChapterHexId && !this.state.title){
            return null;
        }

        return (
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={this.currentChapter.bind(this)}
                style={[styles.currentChapterBox, Styles.row, Styles.flexCenter]}
            >
                <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>
                    { this.state.title }
                </Text>
            </TouchableOpacity>
        );
    }
    // 当前章节 - function
    currentChapter(){
        const { navigation, updateChapter, directory } = this.props;
        const chapterHexId = this.state.currentChapterHexId;
        const bookId = directory && directory.book && directory.book.id;
        const bookHexId = directory && directory.book && directory.book.hexId;

        updateChapter && updateChapter(true);

        this.setState({currentChapterHexId: chapterHexId});
        fineCommonRemoveSingle && fineCommonRemoveSingle('allBookCapter', bookHexId + 'currentChapter');

        navigation && navigation.navigate('Reader',{
            chapterHexId,
            bookHexId,
            bookId
        });
    }
    renderChapterSection(){
        return (
            <TouchableOpacity
                activeOpacity={0.5}
                style={[styles.currentChapterBox, Styles.row, Styles.flexCenter]}
                onPress={this._openPanel.bind(this)}
            >
                <Text style={[Fonts.fontFamily, Fonts.fontSize16, Colors.orange_f3916b]}>
                    { this.state.startIndex }
                    { '\u3000' }
                    { '\u223C' }
                    { '\u3000' }
                    { this.state.endIndex} 章
                </Text>
            </TouchableOpacity>
        );
    }
    // 打开章节选择面板 - function
    _openPanel(){
        const totalRecords = this.props.directory ? this.props.directory.totalRecords : 0;
        const chapterTraverse = ChapterPartition.traverse(Number(totalRecords), 100);

        this.setState({
            visible: true,
            startIndexArr: chapterTraverse.startIndex,
            endIndexArr: chapterTraverse.endIndex,
            totalPage: chapterTraverse.totalPage
        });
    }
    // 关闭章节选择面板 - function
    _closePanel(){
        this.setState({
            visible: false,
        });
    }
    // 在面板里面选择章节区域 - function
    _selectChapterSection(item, index){
        const { reloadChapterDirectory, navigation } = this.props;
        const hexId =  navigation.getParam('hexId');
        const type = navigation.getParam('type');
        const currentOffset = this.state.startIndexArr[index] - 1;

        if(this.state.page === ( index + 1 )){
            return this._closePanel();
        }

        reloadChapterDirectory && reloadChapterDirectory(type, hexId, currentOffset);

        this.setState({
            page: item + 1,
            visible: false,
            startIndex: this.state.startIndexArr[index],
            endIndex: this.state.endIndexArr[index],
        });

        return;
    }
    renderSlideDownToUpPanel(){
        const countArr = _.range(this.state.totalPage);

        return (
            <SlidingUpPanel
                showBackdrop={false}
                allowMomentum={false}
                allowDragging={false}
                height={height}
                visible={this.state.visible}
                onRequestClose={() => this.setState({visible: false})}
            >
                <View style={[styles.panelContent, {backgroundColor: BackgroundColor.bg_fff}]}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        alwaysBounceVertical={true}
                    >
                        {
                            countArr.map((item, index) => {
                                let dotItem = this.state.page === (index+1) ? <View style={styles.selectDot} /> : null;
                                let borderColor = this.state.page === (index+1) ? '#F8AD54' : '#cccccc';

                                return (
                                    <TouchableOpacity
                                        // onPress={() => this.props.page === (index+1) ? this.props.closeChapterSelect() : this._select(item+1)}
                                        key={index}
                                        style={[styles.popRow, Styles.paddingHorizontal15]}
                                        onPress={this._selectChapterSection.bind(this, item, index)}
                                    >
                                        <View>
                                            <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.gray_808080]}>
                                                { this.state.startIndexArr[index] }
                                                { '\u3000' }
                                                { '\u223C' }
                                                { '\u3000' }
                                                { this.state.endIndexArr[index] } 章
                                            </Text>
                                        </View>
                                        <View>
                                            <View style={[styles.singleSelect, Styles.flexCenter,{borderColor: borderColor}]}>
                                                { dotItem }
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                    <TouchableOpacity
                        style={[styles.panelFooter, Styles.flexCenter, Styles.marginHorizontal15]}
                        activeOpacity={0.50}
                        onPress={this._closePanel.bind(this)}
                    >
                        <Text style={[Fonts.fontFamily, Fonts.fontSize15, Colors.orange_f3916b]}>关闭</Text>
                    </TouchableOpacity>
                </View>
            </SlidingUpPanel>
        );
    }
    render(){
        const { navigation } = this.props;
        const type = navigation.getParam('type');

        return (
            <View style={[Styles.container]}>
                { this.renderHeader() }
                {/*{ this.renderCurrentChapter() }*/}
                { this.renderChapterSection() }
                {/*{*/}
                    {/*type === 'chapter' ? this.renderCatalog() :*/}
                    {/*<ScrollableTabView*/}
                        {/*renderTabBar={() => <ReaderCatalogueMenu/>}*/}
                        {/*tabBarInactiveTextColor={'#4c4c4c'}*/}
                        {/*tabBarActiveTextColor={'#f3916b'}*/}
                        {/*tabBarBackgroundColor={'#ffffff'}*/}
                        {/*locked={false}*/}
                        {/*scrollWithoutAnimation={false}*/}
                        {/*prerenderingSiblingsNumber={2}*/}
                    {/*>*/}
                        {/*{ this.renderCatalog() }*/}
                        {/*{ this.renderBookMark() }*/}
                    {/*</ScrollableTabView>*/}
                {/*}*/}
                { this.renderCatalog() }
                { this.renderSlideDownToUpPanel() }
            </View>
        );
    }
}

// 自定义 - 切换菜单
class ReaderCatalogueMenu extends Component{
    render(){
        return (
            <View style={styles.rcHeader}>
                {
                    this.props.tabs.map((name, index) => {
                        const color = this.props.activeTab === index ? BackgroundColor.bg_f3916b : BackgroundColor.bg_808080;

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.75}
                                onPress={this.switchMenu.bind(this, index)}
                                style={[Styles.flexCenter, Styles.flex1, styles.rcMenuBox]}
                            >
                                <View style={[styles.rcMenu, Styles.flexCenter, index === 0 && styles.rightBorder]}>
                                    <Text style={[Fonts.fontFamily, Fonts.fontSize15, {color}]}>{ name }</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }
    switchMenu(index){
        this.props.goToPage && this.props.goToPage(index);
    }
}

const styles = ScaledSheet.create({
    selectDot:{
        width: 12,
        height: 12,
        backgroundColor: '#F8AD54',
        borderRadius: 12,
        overflow: 'hidden',
    },
    singleSelect: {
        borderWidth: 0.6,
        borderStyle:'solid',
        borderColor: '#cccccc',
        width: 20,
        height: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    popRow:{
        flexDirection:'row',
        justifyContent:'space-between',
        height: '44@vs',
        alignItems: 'center'
    },
    panelFooter: {
        height: '60@vs',
        paddingHorizontal: '15@ms',
        flexDirection: 'row',
        borderTopColor: '#e5e5e5',
        borderTopWidth: 1 / pixel,
    },
    slidingUpPanel: {
        width: width,
        height: height,
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1000
    },
    panelContent: {
        flex: 1,
        paddingTop: verticalScale(44 + StatusBar.currentHeight + 14.5),
    },
    currentChapterBox:{
        height: '60@vs',
        borderBottomColor: BackgroundColor.bg_e5e5e5,
        borderBottomWidth: moderateScale(1 / pixel),
    },
    rmbImage: {
        position: 'absolute',
        right: 0,
        width: '24@s',
        height: '24@vs',
        top: '8@vs',
        zIndex: 10,
        tintColor: BackgroundColor.bg_f3916b
    },
    rcBodyRowLeft: {

    },
    contentContainerStyle: {

    },
    rcMenuBox: {
        height: '44@vs',
    },
    rightBorder: {
        borderRightWidth: 1 / pixel,
        borderRightColor: '#e5e5e5',
        borderStyle: 'solid',
    },
    rcMenu: {
        height: '24@vs',
        width: '100%',
    },
    rcHeader: {
        height: '44@vs',
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: 1 / pixel,
        borderStyle: 'solid',
        overflow: 'hidden',
        flexDirection: 'row'
    },
    rcBody: {
        overflow: 'hidden',
        flexDirection: 'column',
        flex: 1,
        paddingHorizontal: '15@ms'
    },
    rcBodyHeader: {
        height: '50@vs',
        justifyContent: 'space-between',
        flexDirection: 'row',
        overflow: 'hidden',
        alignItems: 'center',
    },
    rcBodyRowBut: {
        height: '30@vs',
        borderWidth: 1 / pixel,
        borderStyle: 'solid',
        borderColor: '#808080',
        borderRadius: 2,
        overflow: 'hidden',
        paddingHorizontal: '6@ms'
    },
    rcBodyContent: {
        flex: 1,
    },
    rcBodyRow: {
        height: '40@vs',
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1 / pixel,
        borderStyle : 'dashed',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

const mapStateToProps = (state, ownProps) => {
    const type = ownProps.navigation.getParam('type');
    const hexId = ownProps.navigation.getParam('hexId');

    let data = state.getIn(['chapterDirectory', type, hexId]);
    let localData = state.getIn(['local','chapterTitle', hexId]);
    let userData = state.getIn(['user','userData','baseInfo']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    if(Immutable.Map.isMap(localData)){ localData = localData.toJS() }
    if(Immutable.Map.isMap(userData)){ userData = userData.toJS() }
    return {
        ...ownProps, ...data,
        ...localData , ...userData
    };
};

export default connect(mapStateToProps,{
    reloadChapterDirectory, loadChapterDirectory,
    reloadBookMark, loadBookMark,
    updateChapter
})(ChapterDirectory);







