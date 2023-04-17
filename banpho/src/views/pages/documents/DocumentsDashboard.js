import { useEffect, useState } from 'react';

// material-ui
import { Grid, Typography } from '@mui/material';

// project imports
import EarningCard from '../../dashboard/Default/EarningCard';
import AllCard from '../../dashboard/Default/AllCard';
import FinishCard from '../../dashboard/Default/FinishCard';
import ProcessCard from '../../dashboard/Default/ProcressCard';
import WaitingCard from '../../dashboard/Default/WaitingCard';
import TotalGrowthBarChart from '../../dashboard/Default/TotalGrowthBarChart';
import { gridSpacing } from '../../../store/constant';

const DocumentsDashboard = () => {
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);
    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <AllCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <WaitingCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <ProcessCard isLoading={isLoading} />
                    </Grid>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <FinishCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={12}>
                        <Typography variant="h2" sx={{ marginBottom: '20px' }}>
                            ข้อมูลเอกสารในแต่ละเดือน
                        </Typography>
                        <TotalGrowthBarChart isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default DocumentsDashboard;
