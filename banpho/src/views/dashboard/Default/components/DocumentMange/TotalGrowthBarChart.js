import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

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
import axios from 'axios';

// chart data
// import chartData from '../../chart-data/total-growth-bar-chart';

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const TotalGrowthBarChart = ({ isLoading }) => {
    const [value, setValue] = useState('today');
    const [approve, setApprove] = useState([]);
    const [disapprove, setDisapprove] = useState([]);
    const theme = useTheme();
    const customization = useSelector((state) => state.customization);
    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        console.log('SON.parse(userData) =>', JSON.parse(userData));
        chartApprove(JSON.parse(userData));
        chartDisapprove(JSON.parse(userData));
    }, []);

    function chartApprove(value) {
        const id = value.hospital_id;
        const role = value.role_status;
        const status = 1;

        axios
            .get(`http://localhost:7000/document-chart-manager/${id}/${role}/${status}`)
            .then((response) => {
                const value = response.data.data;
                setApprove(value);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function chartDisapprove(value) {
        const id = value.hospital_id;
        const role = value.role_status;
        const status = 2;
        axios
            .get(`http://localhost:7000/document-chart-manager/${id}/${role}/${status}`)
            .then((response) => {
                const value = response.data.data;
                setDisapprove(value);
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
    const errorMain = theme.palette.error.main;
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
                name: 'ไม่อนุมัติ',
                data: [
                    disapprove[0]?.count,
                    disapprove[1]?.count,
                    disapprove[2]?.count,
                    disapprove[3]?.count,
                    disapprove[4]?.count,
                    disapprove[5]?.count,
                    disapprove[6]?.count,
                    disapprove[7]?.count,
                    disapprove[8]?.count,
                    disapprove[9]?.count,
                    disapprove[10]?.count,
                    disapprove[11]?.count
                ]
            },
            {
                name: 'อนุมัติ',
                data: [
                    approve[0]?.count,
                    approve[1]?.count,
                    approve[2]?.count,
                    approve[3]?.count,
                    approve[4]?.count,
                    approve[5]?.count,
                    approve[6]?.count,
                    approve[7]?.count,
                    approve[8]?.count,
                    approve[9]?.count,
                    approve[10]?.count,
                    approve[11]?.count
                ]
            }
        ]
    };

    useEffect(() => {
        const newChartData = {
            ...chartData.options,
            colors: [errorMain, successMain],
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
