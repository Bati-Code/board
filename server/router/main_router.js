const { default: axios } = require("axios");
const Board = require('../data/board_Schema');
const session = require('express-session');
const moment = require('moment');

module.exports = (app) => {

    let session;

    //로그인
    app.post('/login', (req, res) => {
        const get_data1 = req.body;

        session = req.session;
        session.userID = get_data1;
        console.log("loginSession", session);
        res.send(session.userID);
    })

    //로그아웃
    app.get('/logout', (req, res) => {

        if (session.userID) {
            session.destroy((err) => {
                if (err) {
                    console.log(err, "logout Error");
                    res.json({ logout_result_code: 0 });
                    return;
                }
                else {
                    console.log("logout success");
                    res.json({ logout_result_code: 1 });
                }
            })
            session = undefined;
            console.log("Logout Session", session);
        }
    })

    //세션체크
    app.get('/session_check/:user_ID', (req, res) => {

        const get_user_ID = req.params.user_ID;
        console.log("session_Check", session);

        if (session !== undefined) {
            const get_session_user_ID = session.userID.userID;

            if (get_session_user_ID === get_user_ID) {
                res.json({ session_check_result: 1 });
            }
            else {
                res.json({ session_check_result: 0 });
            }
        }
        else {
            res.json({ session_check_result: 0 });
        }
    })

    //게시글 저장
    app.post('/board/insert', async (req, res) => {
        const get_data = req.body;

        const new_Board = new Board();
        new_Board.post_title = req.body.board_title;
        new_Board.post_author = session.userID.userID;
        new_Board.post_date = moment().format('MM-DD');
        new_Board.post_count = 0;
        new_Board.post_recommend = 0;
        new_Board.post_content = req.body.board_Data;
        new_Board.post_yn = 'y';
        new_Board.post_item_code = req.body.board_item.code;
        new_Board.post_item_name = req.body.board_item.name;

        await new_Board.save((err) => {
            if (err) {
                console.log(err);
                res.json({ board_insert: 0 });
                return;
            }
            else {
                console.log("게시글 업로드");
                res.json({ board_insert: 1 });
            }
        })
    })

    //임시
    app.post('/board/insert/temp', async (req, res) => {
        console.log(req.body);
        res.json({board_insert_result: 1});
    }) 

    //페이지이동 
    app.get('/board/list/:page', async (req, res) => {

        let page = parseInt(req.params.page);
        console.log("page", page)

        if (!page)
            page = 1;

        console.log(page);

        const query = Board.find({ post_yn: 'y' });

        const options = {
            sort: { _id: -1 },
            lean: true,
            limit: 10,
            page: page
        };

        await Board.paginate(query, options)
            .then((result) => {
                res.json(result);
            })

    })

    //검색
    app.get('/board/search/:menuItem/:value/:page', async (req, res) => {
        let page = parseInt(req.params.page);
        const menuItem = req.params.menuItem;
        let value = req.params.value;
        let searchType;

        if (!page)
        page = 1;

        if (menuItem === '제목')
            searchType = 'post_title';
        else if (menuItem === '작성자')
            searchType = "post_author";
        else if (menuItem === "내용")
            searchType = "post_content";
        else if (menuItem === "종목명"){
            searchType = "post_item_name";
            value = toString(value).toUpperCase();
        }
        else if (menuItem === "종목코드")
            searchType = "post_item_code";

        console.log(menuItem, value, searchType);

        const query = Board.find(
            { [searchType]: { $regex: '.*' + value + '.*' }, post_yn: 'y' }
        );

        const options = {
            sort: { _id: -1 },
            lean: true,
            limit: 10,
            page: page
        };

        await Board.paginate(query, options)
            .then((result) => {
                res.json(result);
            })

    })

    //상세페이지
    app.get('/board/view/:board_id', async (req, res) => {

        let board_count;
        console.log("view_id", req.params.board_id);
        await Board.findOne({ _id: req.params.board_id }, (err, boards) => {
            if (err) {
                console.log(err);
                return;
            }
            else {
                boards.post_count += 1;
                board_count = boards.post_count;
                res.json(boards);
            }
        })

        await Board.updateOne({ _id: req.params.board_id }, { post_count: board_count }, (err, data) => {
            if (err) {
                console.log("update Error");
                return;
            }
            else {
                console.log("update clear");
            }
        })

    })

    //추천수 
    app.get('/board/view/recommend/:board_id', async (req, res) => {

        let board_recommend_count;

        await Board.findOne({ _id: req.params.board_id }, (err, boards) => {
            if (err) {
                console.log(err);
                return;
            }
            else {
                boards.post_recommend += 1;
                board_recommend_count = boards.post_recommend;
                res.json(board_recommend_count);
            }
        })

        await Board.updateOne({ _id: req.params.board_id }, { post_recommend: board_recommend_count }, (err, data) => {
            if (err) {
                console.log("update Error");
                return;
            }
            else {
                console.log("recommend update");
            }
        })

    })

    //게시글 수정
    app.post('/board/update', async (req, res) => {

        console.log(req.body);

        await Board.updateOne({ _id: req.body.board_id },
            {
                post_title: req.body.board_title,
                post_content: req.body.board_content
            }, (err) => {
                if (err) {
                    console.log("update Error");
                    res.json({ update_board_result: 0 });
                    return;
                }
                else {
                    console.log("글 수정 완료");
                    res.json({ update_board_result: 1 });
                }
            }
        )
    })

    //게시글 삭제
    app.delete('/board/:board_id', async (req, res) => {
        await Board.updateOne({ _id: req.params.board_id }, { post_yn: 'n' }, (err) => {
            if (err) {
                console.log("Delte Error");
                res.json({ delete_board_result: 0 });
                return;
            }
            else {
                console.log("delte success");
                res.json({ delete_board_result: 1 });
            }
        })
    })
}
