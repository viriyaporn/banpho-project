import { useEffect, useState } from 'react';
import axios from 'axios';

// material-ui
import { Grid, Typography, Card } from '@mui/material';

import AllCard from './components/Tracking/AllCard';
import FinishCard from './components/Tracking/FinishCard';
import ProcessCard from './components/Tracking/ProcressCard';
import WaitingCard from './components/Tracking/WaitingCard';
import TotalGrowthBarChart from './components/Tracking/TotalGrowthBarChart';
import { gridSpacing } from '../../../store/constant';

const DashboardTracking = () => {
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);

    function getProcess(value) {
        const hospital_id = value.hospital_id;

        axios
            .get(`http://localhost:7000/documents-process/${hospital_id}`)
            .then((response) => {
                let count = response.data.data[0].COUNT;
                setCount(count);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={4} md={4} sm={4} xs={12}>
                        <AllCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={12}>
                        <WaitingCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={4} md={4} sm={4} xs={12}>
                        <FinishCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={12}>
                        <div className="" style={{ padding: 10 }}></div>
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

export default DashboardTracking;
