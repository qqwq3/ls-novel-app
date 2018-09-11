
// 章节分区

class ChapterPartition{
    // 取出遍历出来的章节对数
    static traverse(totals, control){
        if(totals >= control){
            let v = totals % control === 0 ? parseInt(totals / control) : parseInt(totals / control) + 1;
            let startIndex = 0,endIndex = 0,startIndexArr = [],endIndexArr = [];
            let m = totals % control === 0 ? totals - v * control : totals - (v-1) * control;

            for(let i=1;i<=v;i++){
                startIndex = control * (i-1) + 1;
                endIndex = i === v ? (totals % control === 0 ? v * control + m : (v-1) * control + m) : control * i;

                startIndexArr.push(startIndex);
                endIndexArr.push(endIndex);
            }
            return {startIndex: startIndexArr, endIndex: endIndexArr,totalPage: v};
        }
        else{
            return {startIndex: [1], endIndex: [totals],totalPage: 1};
        }
    }

    // 取出不遍历的章节对数
    static noTraverse(totals, page, control){
        if(totals >= control){
            let v = totals % control === 0 ? parseInt(totals / control) : parseInt(totals / control) + 1;
            let startIndex = control * (page-1) + 1;
            let m = totals % control === 0 ? totals - v * control : totals - (v-1) * control;
            let endIndex = page === v ? (totals % control === 0 ? v * control + m : (v-1) * control + m) : control * page;

            return {startIndex: startIndex, endIndex: endIndex,totalPage: v};
        }
        else{
            return {startIndex: 1,endIndex: totals,totalPage: 1};
        }
    }
}

export default ChapterPartition;

// 用法如下：

// 取出遍历出来的章节对数
// let chapter = ChapterPartition.traverse(505,1,100);
// chapter.startIndex,chapter.endIndex

// 取出不遍历的章节对数
// let chapter = ChapterPartition.noTraverse(505,1,100);
// chapter.startIndex,chapter.endIndex
































