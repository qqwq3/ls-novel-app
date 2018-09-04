
//微信分享工具类
'use strict';

import * as weChat from 'react-native-wechat';
import { infoToast } from "./Tool";
import { loadUserSession } from '../common/Storage';

const  wxId = 'wxd79fff9d3b933e8b';
// const wxId = 'wx4f60c8eebaec00f1';

export const commonShare = async (
    type: string,
    channelID:string,
    shareUrl:string,
    agentTag:string,
    title?: string = '畅乐读-全网免费看',
    contentText?: string = '畅享阅读时光，遇见美好未来',
    link: string,
) => {
    const shareBody = contentText;
    const shareTitle = title;
    const shareImageUrl: string = 'http://novel-res.oss-cn-hangzhou.aliyuncs.com/icon/400.png';
    // const shareLink: string = shareUrl +`/agoutv/download.html?channelId=${channelID}`;

    const user = await loadUserSession();
    const userId = (user && user.id) || '';
    // http://192.168.188.157:82/share/index.html
    const shareLink: string = link ? link :`${shareUrl}/share/index.html?channelId=${channelID}&agentTag=${agentTag}&user_id=${userId}&shareAgentTag1=1044`;

    shareContent && shareContent(type,shareTitle,shareBody,shareImageUrl,shareLink);
};


/**
 * 分享链接给朋友 or 朋友圈
 * @param type 分享类型： 'friends' or 'friendsCircle'
 * @param title  题目
 * @param description 描述
 * @param thumbImage  图片地址
 * @param webpageUrl  链接路径
 * @param shareType   分享类型：默认为 news
 */

export const shareContent = (
    type: string,
    title: string,
    description: string,
    thumbImage: string,
    webpageUrl: string,
    shareType: string = 'news'
) => {
    const obj: Object = {
        title: title,
        description: description,
        thumbImage: thumbImage,
        type: shareType,
        webpageUrl: webpageUrl
    };

    weChat.registerApp(wxId);
    weChat.isWXAppInstalled()
    .then((isInstalled) => {
        if (isInstalled) {
            // 分享给朋友
            if(type === 'friends'){
                weChat.shareToSession(obj).then(res => {
                    // console.log('5555555', res);
                }).catch((error) => {
                    infoToast && infoToast('分享失败，请稍后再次分享哦');
                });
            }

            // 分享到朋友圈
            if(type === 'friendsCircle'){
                weChat.shareToTimeline(obj).then(res => {
                    // console.log('5555555', res);
                }).catch((error) => {
                    infoToast && infoToast('分享失败，请稍后再次分享哦');
                });
            }
        }
        else {
            infoToast && infoToast('没有安装微信软件，请您安装微信之后再试');
        }
    });
};

// 监听分享
export const shareAddListener = (success: Function => void) => {
    weChat.addListener(
        'SendMessageToWX.Resp',
        (response) => {

            console.log('shareAddListener', response);

            if (parseInt(response.errCode) === 0) {
                success && success();
            }
            else {
                infoToast && infoToast('分享失败，请稍后再次分享哦');
            }
        }
    );
};

// 删除监听 - 分享
export const shareRemoveListener = () => {
    weChat.removeAllListeners();
};

