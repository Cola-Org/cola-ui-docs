express = require 'express'
router = express.Router()

router.get '/tree-nodes', (req, res, next) ->
    root = req.query.root
    if root and root.indexOf('..') >= 0
        res.send(null)
        return

    nodes = []
    path = if root then ('node_modules/' + root) else 'node_modules'

    fs = require 'fs'
    files = fs.readdirSync(path);
    files.forEach (item) ->
        if item.charAt(0) is '.' then return
        itemFile = fs.statSync(path + '/' + item)
        nodes.push(
            name: item
            isDir: itemFile.isDirectory()
            path: if root then (root + '/' + item) else item
        )
    res.send(nodes)
items = require './data/items.coffee'
router.get("/category", (req, res, next)->
    query = req.query
    pageSize = parseInt(query.pageSize or 5)
    pageNo = parseInt(query.pageNo or 1)
    from = (pageNo - 1) * pageSize
    limit = from + pageSize
    res.set({
        "Access-Control-Allow-Origin": "*"
    })

    if query.name
        res.send({
            $entityCount: 0
            $data: []
        })
        return
    result = []
    i = from
    while i <= limit
        result.push({
            id: i,
            name: "分类" + i
            description: "description...."
        })

        i++
    res.send({
        $entityCount: 36
        $data: result
    })
)

router.get '/product', (req, res, next) ->
    query = req.query
    pageSize = parseInt(query.pageSize or 5)
    pageNo = parseInt(query.pageNo or 1)
    from = (pageNo - 1) * pageSize
    limit = from + pageSize
    res.set({
        "Access-Control-Allow-Origin": "*"
    })
    result = []
    for item in items.slice(from, limit)
        item.categoryName = "分类" + query.categoryId
        result.push(item)
    res.send({
        $entityCount: items.length
        $data: result
    })

module.exports = router
