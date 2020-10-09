import React from 'react';
import { isMobileOnly } from "react-device-detect";
import { HomeDesktop } from './HomeDesktop';
import { HomeMobile } from './HomeMobile';
export class Home extends React.Component {
    render() {
        if (isMobileOnly) {
            return <HomeMobile />
        }
        return <HomeDesktop />
    }
}