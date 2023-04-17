import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';

// third-party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports
import SkeletonTotalGrowthBarChart from '../../../../../ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from '../../../../../ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data
// import chartData from '../../chart-data/total-growth-bar-chart';

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const TotalGrowthBarChart = ({ isLoading }) => {
    const [value, setValue] = useState('today');
    const [finish, setFinish] = useState([]);
    const [process, setProcess] = useState([]);
    const theme = useTheme();
    const customization = useSelector((state) => state.customization);
    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        chartFinish(JSON.parse(userData));
        chartProcess(JSON.parse(userData));
    }, []);

    function chartFinish(value) {
        const id = value.hospital_id;
        axios
            .get(`http://localhost:7000/tracking-chart/${id}`)
            .then((response) => {
                console.log('response.data =>', response.data.data);
                const value = response.data.data;
                setFinish(value);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function chartProcess(value) {
        const id = value.hospital_id;
        axios
            .get(`http://localhost:7000/tracking-chart-process/${id}`)
            .then((response) => {
                console.log('response.data =>', response.data.data);
                const value = response.data.data;
                setProcess(value);
            })
            .catch((error) => {
                console.error(error);
            });
    }
    const { navType } = customization;
    const { primary } = theme.palette.text;
    const darkLight = theme.palette.dark.light;
    const grey200 = theme.palette.grey[200];
    const grey500 = theme.palette.grey[500];

    const primary200 = theme.palette.primary[200];
    const primaryDark = theme.palette.primary.dark;
    const secondaryMain = theme.palette.secondary.main;
    const secondaryLight = theme.palette.secondary.light;

    const warningMain = theme.palette.warning.main;
    const successMain = theme.palette.success.main;

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
                fontSize: '18px',
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
                name: 'อยู่ในกระบวนการฆ่าเชื้อ',
                data: [
                    process[0]?.count,
                    process[1]?.count,
                    process[2]?.count,
                    process[3]?.count,
                    process[4]?.count,
                    process[5]?.count,
                    process[6]?.count,
                    process[7]?.count,
                    process[8]?.count,
                    process[9]?.count,
                    process[10]?.count,
                    process[11]?.count
                ]
            },
            {
                name: 'เสร็จสิ้น',
                data: [
                    finish[0]?.count,
                    finish[1]?.count,
                    finish[2]?.count,
                    finish[3]?.count,
                    finish[4]?.count,
                    finish[5]?.count,
                    finish[6]?.count,
                    finish[7]?.count,
                    finish[8]?.count,
                    finish[9]?.count,
                    finish[10]?.count,
                    finish[11]?.count
                ]
            }
        ]
    };

    useEffect(() => {
        const newChartData = {
            ...chartData.options,
            colors: [warningMain, successMain],
            xaxis: {
                labels: {
                    style: {
                        colors: [primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary]
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: [primary]
                    }
                }
            },
            grid: {
                borderColor: grey200
            },
            tooltip: {
                theme: 'light'
            },
            legend: {
                labels: {
                    colors: grey500
                }
            }
        };

        // do not load chart when loading
        if (!isLoading) {
            ApexCharts.exec(`bar-chart`, 'updateOptions', newChartData);
        }
    }, [navType, primary200, primaryDark, secondaryMain, secondaryLight, primary, darkLight, grey200, isLoading, grey500]);

    return (
        <>
            {isLoading ? (
                <SkeletonTotalGrowthBarChart />
            ) : (
                <MainCard>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item>
                                    <Grid container direction="column" spacing={1}></Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Chart {...chartData} />
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </>
    );
};

TotalGrowthBarChart.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalGrowthBarChart;
