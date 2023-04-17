import React, { useState, useEffect } from 'react';
import { Card, Button, TextField } from '@mui/material';

const TrackingForm = () => {
    return (
        <div>
            <Card sx={{ minWidth: 275, minHeight: '100vh' }}>
                <Typography align="center" variant="h3" sx={{ fontWeight: 500 }}>
                    แบบฟอร์มการส่งเอกสาร
                </Typography>
                <TextField fullWidth id="outlined-basic" label="Outlined" variant="outlined" /> <br />
                <TextField id="outlined-multiline-static" label="Multiline" multiline rows={4} defaultValue="Default Value" />
                <Button variant="contained" component="label">
                    Upload File
                    <input type="file" hidden />
                </Button>
                <Button variant="contained">ยืนยัน</Button>
            </Card>
        </div>
    );
};

export default TrackingForm;
