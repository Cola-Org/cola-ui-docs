years = [2014, 2015, 2016]
personNames = ["张三", "李四", "郭靖", "王岳伦", "海清", "唐国强", "崔健", "郜海秋", "丁翰采", "文世英"]
deptNames = ["市场部", "销售部", "研发部", "售后服务部", "咨询处", "人力资源部", "设计部", "产品支持部", "项目支持部"]
randomBy = (under, over)->
    len = arguments.length
    if len == 1
        return  parseInt(Math.random() * under + 1)
    if len == 2
        return parseInt(Math.random() * (over - under + 1) + under)

    return 0
module.exports =
    makePersonName: ()-> personNames[randomBy(personNames.length) - 1]
    makeDeptName: ()-> deptNames[randomBy(deptNames.length) - 1]
    makeDate: (date, type)->
        dataStr = years[randomBy(years.length) - 1] + "-" + randomBy(12) + "-" + randomBy(1, 27)
        date = date or new Date(dataStr)
        type = type or ">"
        year = date.getFullYear()
        month = date.getMonth() + 1

        dataStr = ( if type == ">" then  (year + 1) else (year - 1) ) + "-" + month + "-" + (date.getDay() + 1)
        return new Date(dataStr);
    makeAmount: (under, over)-> randomBy(under, over)
