import { DownOutlined, FilterTwoTone } from '@ant-design/icons';
import { LineChart, Line, Tooltip, YAxis } from 'recharts';
import { Button, Dropdown, Input, Menu, Pagination, Modal, Radio } from 'antd';
import "antd/dist/antd.css";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { Page_Search, Page_Store, Page_Reset } from '../../redux/action/page_action';
import dayjs from 'dayjs';
import ChatIcon from '@material-ui/icons/Chat';
import "./css/BoardSearchCSS.css";
import { server_config } from '../../server_config';
import utc from 'dayjs/plugin/utc';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from '@mui/material';

const { Search } = Input;
dayjs.extend(utc);

const Board_Infinity = () => {

    const [get_BoardList, set_BoardList] = useState([]);
    const [get_Board_Total, set_Board_Total] = useState(0);
    const [get_Modal_Visible, set_Modal_Visible] = useState(false);
    const [get_Chart_Modal_Visible, set_Chart_Modal_Visible] = useState(false);
    const [get_Modal_Board_List, set_Modal_Board_List] = useState([]);
    const [get_attention_count, set_attention_count] = useState([]);
    const [get_chart_data, set_chart_data] = useState('');


    const [get_page, set_page] = useState(2);

    const history = useHistory();
    const dispatch = useDispatch();

    const { count, page, search, menu_select, search_value, radio } = useSelector(state => state.pageStore);

    const Get_Attention = (boardList) => {
        let fin_code_List = [];
        for (let i = 0; i < boardList.length; i++) {
            fin_code_List.push(boardList[i].post_fin_list.code);
        }

        axios.post(server_config.server_Address + '/board/countBoard',
            {
                'fin_code_list': fin_code_List,
            })
            .then((response) => {
                console.log("COUNT : ", response.data.countBoard);
                set_attention_count(get_attention_count.concat(response.data.countBoard));
            })
    }


    useEffect(() => {
        axios.get(server_config.server_Address + '/board/list/' + page)
            .then((response) => {
                const boardList = response.data.docs;
                set_Board_Total(response.data.totalDocs);

                Get_Attention(boardList);

                boardList.map((list, index) => {
                    list.index = index + 1;
                    list.key = index + 1;
                });
                set_BoardList(boardList);

                console.log("BoardList : B");
                console.log("B : ", response.data.docs);
            })
    }, [])

    const DateDisplay = (list_date) => {
        let date;
        if (dayjs().format('YYYYMMDD') == dayjs(list_date).format('YYYYMMDD')) {
            date = dayjs(list_date).utc(9).format('HH:mm');
        } else {
            date = dayjs(list_date).utc(9).format('MM-DD HH:mm');
        }

        return (date)
    }

    const Modal_Visible_Handler = (flag, data) => {
        if (flag == 1) {
            set_Modal_Visible(true);
            axios.get(server_config.server_Address + '/board/search/author/' + data)
                .then((response) => {
                    console.log(response.data);
                    set_Modal_Board_List(response.data);
                });
        }
        else if (flag == 0) {
            set_Modal_Visible(false);
        }
        else if (flag == 3) {
            set_Chart_Modal_Visible(true);

            axios.post(server_config.server_Address + '/board/chart',
                {
                    fin_name: data,
                })
                .then((response) => {
                    console.log(response.data);
                    set_chart_data(response.data);
                })
        }
        else if (flag == 4) {
            set_Chart_Modal_Visible(false);
        }
    }

    const next = async () => {

        console.log("next");

        await axios.get(server_config.server_Address + '/board/list/' + get_page)
            .then((response) => {
                console.log("AA");
                let boardList = response.data.docs;
                set_Board_Total(response.data.totalDocs);

                Get_Attention(boardList);
                boardList = get_BoardList.concat(boardList);

                boardList.map((list, index) => {
                    list.index = index + 1;
                    list.key = index + 1;
                });

                console.log("BoardList : B");
                console.log("B : ", response.data.docs);

                set_BoardList(boardList);
                set_page(get_page + 1);
                console.log("BBB : ", boardList);
            })


    }

    return (
        <>

            <div>
                <InfiniteScroll
                    dataLength={get_BoardList.length}
                    next={next}
                    hasMore={true}
                    loader={
                        <div className="board_temp_wrap">
                            <Skeleton animation="wave"
                                style={{
                                    marginLeft: "10px",
                                    width: '50%',
                                }} />
                            <Skeleton animation="wave"
                                style={{
                                    marginLeft: "10px",
                                    width: '90%',
                                }} />
                        </div>
                    }
                    scrollableTarget="board_list"
                    endMessage={
                        <p style={{ textAlign: "center" }}>
                            <b>Yay! You have seen it all</b>
                        </p>
                    }
                >

                    {
                        get_BoardList.map((list, index) => {
                            return (
                                <div className="board_temp_wrap" key={index}>
                                    <div className="board_title"
                                        onClick={() => {
                                            history.push("/board/view/" + list._id);
                                        }}>
                                        [{list?.post_fin_list.name}] {list.post_title}
                                        <span className="board_comment_count">
                                            <ChatIcon style={
                                                {
                                                    fontSize: '1.2rem',
                                                    marginRight: '3px',
                                                }
                                            } />{list.post_comment.length}
                                        </span>
                                    </div>
                                    <ul className="board_info">
                                        <li className="post_author"
                                            onClick={() => {
                                                Modal_Visible_Handler(1, list.post_author);
                                            }}>{list.post_author}</li> <li> | </li>
                                        <li>{DateDisplay(list.post_date)}</li> <li> | </li>
                                        <li>조회 : {list.post_count}</li> <li> | </li>
                                        <li>추천 : {list.post_recommend}</li>  <li> | </li>
                                        <li id={(Math.round(get_attention_count[list.index - 1]?.fin_count /
                                            get_attention_count[list.index - 1]?.total_count * 100) > 30) ? "red" : ''}

                                            onClick={() => {
                                                Modal_Visible_Handler(3, list.post_fin_list.name);
                                            }}>관심도 : {
                                                get_attention_count[list.index - 1]?.total_count !== 0 ?
                                                    (Math.round(get_attention_count[list.index - 1]?.fin_count /
                                                        get_attention_count[list.index - 1]?.total_count * 100))
                                                    : 0
                                            } %</li>
                                    </ul>
                                </div>
                            )
                        })
                    }



                </InfiniteScroll>
            </div>
            <div>
                <Modal title="작성자 최근 게시글" visible={get_Modal_Visible}
                    footer={null} onCancel={() => { Modal_Visible_Handler(0, '') }}>
                    {get_Modal_Board_List.map((list, index) => {
                        console.log(list);
                        return (
                            <div className="board_temp_wrap" key={index}>
                                <div className="board_title"
                                    onClick={() => {
                                        Modal_Visible_Handler(0, '');
                                        history.push("/board/view/" + list._id);
                                    }}>
                                    [{list?.post_fin_list.name}] {list.post_title}
                                    <span className="board_comment_count">
                                        <ChatIcon style={
                                            {
                                                fontSize: '1.2rem',
                                                marginRight: '3px',
                                            }
                                        } />{list.post_comment.length}
                                    </span>
                                </div>
                                <ul className="board_info">
                                    <li>{DateDisplay(list.post_date)}</li> <li> | </li>
                                    <li>조회 : {list.post_count}</li> <li> | </li>
                                    <li>추천 : {list.post_recommend}</li>
                                </ul>
                            </div>
                        );
                    })}
                </Modal>
                <Modal title={get_chart_data.fin_name} visible={get_Chart_Modal_Visible}
                    footer={null} onCancel={() => { Modal_Visible_Handler(4, '') }}>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={get_chart_data.chart_data}>
                            <XAxis dataKey="name" stroke="#8884d8" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                                tickFormatter={(timeStr) => dayjs(timeStr).format("MM/DD")}
                                labelFormatter={(value) => `날짜: ${value}`}
                                formatter={(value) => [value + "%", "관심도"]}
                            />
                            <Line type="monotone" dataKey="data" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </Modal>
            </div>
        </>
    )

}



export default Board_Infinity;

