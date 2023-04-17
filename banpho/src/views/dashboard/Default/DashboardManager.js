import { useEffect, useState } from 'react';

// material-ui
import { Grid, Typography } from '@mui/material';

import AllCard from './components/DocumentMange/AllCard';
import ProcessCard from './components/DocumentMange/ProcressCard';
import ApproveCard from './components/DocumentMange/ApproveCard';
import DisapproveCard from './components/DocumentMange/DisapproveCard';
import TotalGrowthBarChart from './components/DocumentMange/TotalGrowthBarChart';
import { gridSpacing } from '../../../store/constant';

const DashboardManager = () => {
    const [isLoading, setLoading] = useState(true);

    const chartData = {
        height: 480,
        type: 'bar',
        options: {
            chart: {
                id: 'bar-chart',
                stacked: true,
                toolbar: {
                    show: true
                },
                zoom: {
                    enabled: true
                }
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0
                        }
                    }
                }
            ],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '50%'
                }
            },
            xaxis: {
                type: 'category',
                categories: ['ม.ค.', 'ก.พ.', 'มี.ค', 'เม.ย', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
            },
            legend: {
                show: true,
                fontSize: '14px',
                fontFamily: `'Kanit', sans-serif`,
                position: 'bottom',
                offsetX: 20,
                labels: {
                    useSeriesColors: false
                },
                markers: {
                    width: 16,
                    height: 16,
                    radius: 5
                },
                itemMargin: {
                    horizontal: 15,
                    vertical: 8
                }
            },
            fill: {
                type: 'solid'
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                show: true
            }
        },
        series: [
            {
                name: 'รอการอนุมัติ',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'อนุมัติแล้ว',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'ไม่อนุมัติ',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    };
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={4} md={4} sm={4} xs={12}>
                        <ProcessCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={12}>
                        <DisapproveCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={12}>
                        <ApproveCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={12}>
                        <Typography variant="h2" sx={{ marginBottom: '20px' }}>
                            ข้อมูลการส่งในแต่ละเดือน
                        </Typography>
                        <TotalGrowthBarChart isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default DashboardManager;
