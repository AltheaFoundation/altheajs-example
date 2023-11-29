import React, { useState } from 'react';
import styled from 'styled-components';
import SubmitMsgSend from './SubmitMsgSend';
import SubmitMsgLiquify from './SubmitMsgLiquify'
import AccountInfo from './AccountInfo'
import GravityMsgSend from './GravityMsgSend';
import GravityMsgSendToEth from './GravityMsgSendToEth';

const Tab = styled.button`
    font-size: 15px;
    padding: 10px 60px;
    margin: 10px 1px;
    cursor: pointer;
    opacity: 0.6;
    background: white;
    border: 0;
    outline: 0;

    ${({ selected }) =>
        selected && `
        opacity:1;
    `}
}
`;

const ButtonGroup = styled.div`
    display:flex;
`;

const types = ['Bank Send', 'Microtx Liquify', 'Account Info', 'Gravity Send', 'Gravity SendToEth'];

export default function Tabs() {
    const [active, setActive] = useState(types[0])
    return (
        <>
            <ButtonGroup>
                {types.map(type => (
                    <Tab key={type} selected={active === type} onClick={() => setActive(type)}>
                        {type}
                    </Tab>
                ))}
            </ButtonGroup>
            {active === types[0] ? (<SubmitMsgSend />) : (null)}
            {active === types[1] ? (<SubmitMsgLiquify />) : (null)}
            {active === types[2] ? (<AccountInfo />) : (null)}
            {active === types[3] ? (<GravityMsgSend />) : (null)}
            {active === types[4] ? (<GravityMsgSendToEth />) : (null)}
        </>
    )
}