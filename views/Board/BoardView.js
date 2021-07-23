import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom';
import { Modal, Button } from 'antd'
import { LikeOutlined, TableOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './css/Board_View_CSS.css'
import { useSelector } from 'react-redux';

const BoardView = (res) => {
    const [get_board_data, set_board_data] = useState({});
    const [get_board_recommend, set_board_recommend] = useState('');
    const [get_user_check, set_user_check] = useState(false);
    const [visible, setVisible] = React.useState(false);
    const [confirmLoading, setConfirmLoading] = React.useState(false);
    const history = useHistory();
    const board_id = res.match.params.id;

    useEffect(() => {
        // const meta = document.createElement('meta');
        // meta.name = "viewport";
        // meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
        // document.getElementsByTagName('head')[0].appendChild(meta);

        axios.get("http://localhost:5000/board/view/" + board_id)
            .then((request) => {
                set_board_data(request.data);
            })
    }, [])

    useEffect(() => {
        document.getElementById('board_info_recommend').innerText = "추천 : " + get_board_recommend;
    }, [get_board_recommend])

    const recommend_Handler = () => {
        axios.get("http://localhost:5000/board/view/recommend/" + board_id)
            .then((request) => {
                console.log(request.data);
                set_board_recommend(request.data);
            })
    }

    useEffect(() => {
        axios.get("http://localhost:5000/session_check/" + sessionStorage.getItem('user_ID'))
            .then((request) => {
                console.log(request.data);
                if (sessionStorage.getItem('user_ID') === get_board_data.post_author
                    && request.data.session_check_result) {
                    set_user_check(true);
                }
            })
    }, [get_board_data])

    const updateBoard = () => {
        history.push('/board/update/' + board_id);
    }

    const showModal = () => {
        setVisible(true);
    };

    const handle_DeleteBoard_Ok = () => {
        setConfirmLoading(true);
        axios.delete("http://localhost:5000/board/" + board_id)
            .then((response) => {
                console.log(response);
                if (response.data.delete_board_result === 0) {
                    console.log("삭제 오류");
                    history.push('/main');
                }
                if (response.data.delete_board_result === 1) {
                    console.log("삭제 성공");
                    history.push('/main');
                }
            })
    };

    const handle_DeleteBoard_Cancel = () => {
        setVisible(false);
    };

    return (
        <>
            <div className="board_view_wrap">
                <div className="board_view_Header">
                    주식토론 게시판
                </div>
                <div className="board_view_container">
                    <section className="board_content">
                        <nav>
                        </nav>
                        <main>
                            <div id="board_info_wrap">
                                <div>
                                    <div id="board_info_title">
                                      [{get_board_data.post_item_name}]{get_board_data.post_title}
                                    </div>
                                </div>
                                <ul id="board_info">
                                    <li id="board_info_data">
                                        {get_board_data.post_author}
                                    </li>
                                    <li>  |  </li>
                                    <li id="board_info_data">
                                        {get_board_data.post_date}
                                    </li>
                                    <li>  |  </li>
                                    <li id="board_info_data">
                                        조회 : {get_board_data.post_count}
                                    </li>
                                    <li>  |  </li>
                                    <li id="board_info_recommend">
                                        추천 : {get_board_data.post_recommend}
                                    </li>

                                </ul>
                            </div>
                            <div id="board_content">
                                <div dangerouslySetInnerHTML={{ __html: get_board_data.post_content }}></div>
                            </div>
                        </main>
                        <aside>
                        </aside>
                    </section>
                </div>
                <div className="BoardView_footer">
                    <div>
                        <Button type="primary" icon={<TableOutlined />}
                            onClick={() => history.push('/main')}>
                            목록
                        </Button>
                    </div>
                    <div>
                        <Button type="primary" icon={<LikeOutlined />} onClick={recommend_Handler}>
                            추천
                        </Button>
                    </div>
                    {get_user_check ?
                        <div>
                            <Button type="primary" icon={<EditOutlined />} onClick={updateBoard}>
                                수정
                            </Button>
                        </div>
                        : ''}
                    {get_user_check ?
                        <div>
                            <Button type="danger" icon={<DeleteOutlined />} onClick={showModal}>
                                삭제
                            </Button>
                        </div>
                        : ''}
                </div>
                <div>
                    <Modal
                        title="게시글 삭제"
                        visible={visible}
                        onOk={handle_DeleteBoard_Ok}
                        confirmLoading={confirmLoading}
                        onCancel={handle_DeleteBoard_Cancel}
                        okText="삭제"
                        cancelText="취소"
                    >
                        <p>정말 삭제하시겠습니까?</p>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export default BoardView;