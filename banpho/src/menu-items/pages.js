import React, { useState, useEffect } from 'react';
import {
    IconFileDescription,
    IconBoxSeam,
    IconHome,
    IconUsers,
    IconFileX,
    IconFileCheck,
    IconFileImport,
    IconFileText,
    IconUserExclamation,
    IconClipboardText,
    IconCar,
    IconFlask,
    IconHomeSignal,
    IconFileOff
} from '@tabler/icons';

const icons = {
    IconFileDescription,
    IconBoxSeam,
    IconHome,
    IconUsers,
    IconFileX,
    IconFileCheck,
    IconFileImport,
    IconFileText,
    IconUserExclamation,
    IconClipboardText,
    IconCar,
    IconFlask,
    IconHomeSignal,
    IconFileOff
};
// const userData = localStorage.getItem('user_data');
// const user = JSON.parse(userData);
// const role = user.user_role;

const userData = localStorage.getItem('user_data');
let user;
if (userData && userData !== 'undefined') {
    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error('Error parsing user data: ', error);
    }
}
const role = user?.user_role;
let pages = {
    id: 'pages',
    title: 'หน้าเพจ',
    caption: '',
    type: 'group',
    children: []
};
if (role === 'hospital staff') {
    pages.children = [
        {
            id: 'tracking',
            title: 'การนำส่งอุปกรณ์',
            type: 'collapse',
            icon: icons.IconBoxSeam,
            children: [
                {
                    id: 'dashboard-tracking',
                    title: 'หน้าหลัก',
                    type: 'item',
                    url: '/dashboard-tracking',
                    target: true
                },
                {
                    id: 'tracking',
                    title: 'จัดส่งอุปกรณ์การแพทย์',
                    type: 'item',
                    url: '/tracking',
                    target: true
                },
                {
                    id: 'tracking',
                    title: 'กระบวนการฆ่าเชื้อ',
                    type: 'item',
                    url: '/tracking-process',
                    target: true
                },
                {
                    id: 'tracking',
                    title: 'รับอุปกรณ์คืนเรียบร้อย',
                    type: 'item',
                    url: '/tracking-success',
                    target: true
                }
            ]
        },
        {
            id: 'documents',
            title: 'การนำส่งเอกสาร',
            type: 'collapse',
            icon: icons.IconFileImport,
            children: [
                {
                    id: 'dashboard-document',
                    title: 'หน้าหลัก',
                    type: 'item',
                    icon: icons.IconHomeSignal,
                    IconFileOff,
                    url: '/dashboard-document',
                    target: true
                },
                {
                    id: 'documents',
                    title: 'รอการอนุมัติ',
                    type: 'item',
                    icon: icons.IconFileDescription,
                    url: '/documents',
                    target: true
                },
                {
                    id: 'documents',
                    title: 'ไม่อนุมัติ',
                    type: 'item',
                    icon: icons.IconFileX,
                    url: '/documents-disapprove',
                    target: true
                },
                {
                    id: 'documents',
                    title: 'อนุมัติเรียบร้อย',
                    type: 'item',
                    icon: icons.IconFileCheck,
                    url: '/documents-approve',
                    target: true
                }
            ]
        }
    ];
} else if (role === 'officer' || role === 'assistant' || role === 'director' || role === 'director hospital') {
    pages.children = [
        {
            id: 'home',
            title: 'หน้าหลัก',
            type: 'item',
            url: '/dashboard-documents',
            icon: icons.IconHome,
            target: true
        },
        {
            id: 'report-documents',
            title: 'รายงานเอกสาร',
            type: 'collapse',
            icon: icons.IconFileDescription,
            children: [
                {
                    id: 'report-documents',
                    title: 'รอการอนุมัติ',
                    type: 'item',
                    url: '/report-documents',
                    icon: icons.IconFileDescription,
                    target: true
                },
                {
                    id: 'report-documents-approve',
                    title: 'อนุมัติแล้ว',
                    type: 'item',
                    url: '/report-documents-approve',
                    icon: icons.IconFileCheck,
                    target: true
                },
                {
                    id: 'report-documents-disapproved',
                    title: 'ไม่อนุมัติ',
                    type: 'item',
                    icon: icons.IconFileX,
                    url: '/report-documents-disapproved',
                    target: true
                }
            ]
        }
    ];
} else if (role === 'admin') {
    pages.children = [
        {
            id: 'users',
            title: 'สมาชิก',
            type: 'collapse',
            icon: icons.IconUsers,
            children: [
                {
                    id: 'user-edit',
                    title: 'จัดการสมาชิก',
                    type: 'item',
                    icon: icons.IconUserExclamation,
                    url: '/users',
                    target: true
                }
            ]
        },
        {
            id: 'hospital',
            title: 'โรงพยาบาล',
            type: 'collapse',
            icon: icons.IconUsers,
            children: [
                {
                    id: 'user-edit',
                    title: 'จัดการโรงพยาบาล',
                    type: 'item',
                    icon: icons.IconUserExclamation,
                    url: '/hospital',
                    target: true
                }
            ]
        }
    ];
}
export default pages;
