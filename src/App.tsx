import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { CsvUploadButton } from "./components/CsvUploadButton";
import { csvParse } from "./util/file-helper";
import { useState } from "react";
import { CacheFlow } from "./components/CacheFlow";
import { CSVData } from "./models/types";
import { Grid, Paper, Tab, Tabs, TextField, Typography } from "@mui/material";
import { CustomTabPanel } from "./components/CustomTabPannel";
import { Preference } from "./components/Preference";
import { usePersistState } from "./util/hooks";
import { ExpenceResult } from "./components/ExpenceResult";

export default function App() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [value, setValue] = useState(0);
  const [partnerAccount, setPartnerAccount] = usePersistState<string[]>({
    key: "partnerAccount",
    initialValue: [],
  });
  const [expenceList, setExpenceList] = usePersistState<string[]>({
    key: "expenceList",
    initialValue: [],
  });
  const [expenceSubList, setExpenceSubList] = usePersistState<string[]>({
    key: "expenceSubList",
    initialValue: [],
  });
  const [rate, setRate] = usePersistState<number>({
    key: "rate",
    initialValue: 0.5,
  });
  const [partnerName, setPartnerName] = usePersistState<string>({
    key: "partnerName",
    initialValue: "パートナー",
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSubmit = async (file: File) => {
    try {
      const csvCells = await csvParse(file, { header: false });
      setCsvData(csvCells);
      console.log(csvCells);
    } catch (error) {
      alert(error);
    }
  };
  const handleRateChange = (e: any) => {
    setRate(e.target.value);
  };
  const handlePartnerChange = (e: any) => {
    setPartnerName(e.target.value);
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  return (
    <Container maxWidth={"xl"}>
      <Box sx={{ mt: 3, mb: 2 }}>
        <CsvUploadButton onSubmit={handleSubmit} />
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
        >
          <Tab label='結果' {...a11yProps(0)} />
          <Tab label='設定' {...a11yProps(1)} />
          <Tab label='詳細' {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Box>
          <ExpenceResult
            data={csvData}
            expence={expenceList}
            expenceSub={expenceSubList}
            partnerAccount={partnerAccount}
            rate={rate}
            partnerName={partnerName}
          ></ExpenceResult>
        </Box>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Grid container>
          <Grid item xs={3}>
            <Typography variant='h5' sx={{ mt: 1 }}>
              {"割合設定"}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField
                name='rate'
                value={rate}
                size='small'
                onChange={(e) => handleRateChange(e)}
              />
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Typography variant='h5' sx={{ mt: 1 }}>
              {"パートナー名"}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField
                name='name'
                value={partnerName}
                size='small'
                onChange={(e) => handlePartnerChange(e)}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={3}>
            <Preference
              title={"経費大項目設定"}
              list={expenceList}
              setList={setExpenceList}
            />
          </Grid>
          <Grid item xs={3}>
            <Preference
              title={"経費中項目設定"}
              list={expenceSubList}
              setList={setExpenceSubList}
            />
          </Grid>
          <Grid item xs={3}>
            <Preference
              title={"パートナー金融機関設定"}
              list={partnerAccount}
              setList={setPartnerAccount}
            />
          </Grid>
        </Grid>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Paper style={{ maxHeight: "calc(100vh - 130px)", overflow: "auto" }}>
          <CacheFlow data={csvData} />
        </Paper>
      </CustomTabPanel>
    </Container>
  );
}
