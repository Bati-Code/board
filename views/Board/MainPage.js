import { FormOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios'
import { Button } from 'antd';
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux';


import { Finance_List_Store } from '../../redux/action/finance_list_action';
import Board from './Board'
import './css/BoardCSS.css'

const MainPage = () => {
    const [get_Session_Result, set_Session_Result] = useState(0);
    const [get_Login_Text, set_Login_Text] = useState('로그인');

    const history = useHistory();
    const dispatch = useDispatch();

    useEffect(() => {
        // const meta = document.createElement('meta');
        // meta.name = "viewport";
        // meta.content = "width=device-width, initial-scale=0.9, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
        // document.getElementsByTagName('head')[0].appendChild(meta);

        console.log("MainPage");
        axios.get('http://localhost:5000/session_check/' + sessionStorage.getItem('user_Token'))
            .then((request) => {
                const result_code = request.data.session_check_result;
                console.log("MainPage session result", request.data);

                set_Session_Result(result_code);
                if (result_code === 1)
                    set_Login_Text('로그아웃');
                else
                    set_Login_Text('로그인');

            })

        axios.get('http://hitalk-investment.hitalkplus.com:4050/StockCode?ETF=1')
            .then((response) => {

                response.data.datalist.map((list, index) => {
                    delete list.reason;
                    delete list.dtfchk;
                    delete list.reason_no;
                    delete list.type;
                    delete list.etfchk;
                    delete list.use_yn;
                })

                console.log(response.data.datalist);
                dispatch(Finance_List_Store(response.data.datalist));
            })

    }, [])

    const Insert_Session_Handler = () => {


        if (get_Session_Result === 1) {
            history.push('/board/insert');
        }
        else {
            alert("로그인이 필요한 페이지입니다.");
            history.push('/login');
        }
    }

    const login_Handler = () => {

        if (get_Session_Result === 1) {
            axios.get('http://localhost:5000/logout/' + sessionStorage.getItem('user_Token'))
                .then((response) => {
                    console.log(response.data);
                    if (response.data.logout_result_code === 1) {
                        history.push('/login');
                    }
                })
        }
        else {
            history.push('/login');
        }
    }

    console.log(get_Session_Result);

    return (
        <>
            <div className="board_wrap">
                <div className="board_Header">
                    <a href="/main">
                        주식토론 게시판
                    </a>
                </div>
                <div className="container">
                    <section className="board_content">
                        <nav>
                        </nav>
                        <main>
                            <Board></Board>
                        </main>
                        <aside>
                        </aside>
                    </section>
                </div>
                <div className="Board_footer">
                    <div>
                        <Button onClick={Insert_Session_Handler} icon={<FormOutlined />}>
                            글 작성
                        </Button>
                    </div>
                    <div>
                        <Button onClick={login_Handler} icon={<UserOutlined />}>
                            {get_Login_Text}
                        </Button>
                    </div>

                </div>
            </div>
        </>
    )

}
export default MainPage;