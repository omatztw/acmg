import { useMemo } from "react";
import { CSVData } from "../models/types";
import { Box, Card, CardContent, Grid } from "@mui/material";

type Props = {
  data: CSVData[];
  expence: string[];
  expenceSub: string[];
  partnerAccount: string[];
  rate: number;
  partnerName: string;
};

export const ExpenceResult = (props: Props) => {
  const { data, expence, expenceSub, partnerAccount, rate, partnerName } =
    props;
  const displayPartnerName = partnerName || "パートナー";
  const expenceSet = new Set(expence);
  const expenceSubSet = new Set(expenceSub);
  const partnerAccountSet = new Set(partnerAccount);
  const expenceSum = useMemo(() => {
    const filtered = data
      .filter((d) => d.計算対象 === "1")
      .filter((d) => !expenceSet.has(d.大項目))
      .filter((d) => !expenceSubSet.has(d.中項目))
      .filter((d) => !!parseInt(d["金額（円）"]));
    const special = filtered.filter((d) => !Number.isNaN(parseInt(d.メモ)));

    const specialTotal = special.reduce(
      (p, c) => p + parseInt(c["金額（円）"]),
      0
    );
    const specialOffer = special.reduce(
      (p, c) => p + (parseInt(c["金額（円）"]) * parseInt(c.メモ)) / 100,
      0
    );

    const partner = filtered
      .filter((d) => partnerAccountSet.has(d.保有金融機関))
      .reduce((p, c) => p + parseInt(c["金額（円）"]), 0);
    const expenceAll = filtered.reduce(
      (p, c) => p + parseInt(c["金額（円）"]),
      0
    );
    const need = Math.floor((expenceAll - specialTotal) * rate + specialOffer);
    const lack = need - partner;
    return {
      sum: expenceAll,
      partner: partner,
      need: need,
      lack: lack,
      specialTotal: specialTotal,
      specialOffer: specialOffer,
    };
  }, [props]);
  return (
    <Box>
      <Card variant='outlined'>
        <CardContent>
          <Grid container direction={"column"}>
            <Grid item>
              <Grid container direction={"row"}>
                <Grid item width={"200px"}>
                  経費合計:
                </Grid>
                <Grid item>{expenceSum.sum.toLocaleString()} 円</Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction={"row"}>
                <Grid item width={"200px"}>
                  {displayPartnerName}支払い:
                </Grid>
                <Grid item>{expenceSum.need.toLocaleString()} 円</Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction={"row"}>
                <Grid item width={"200px"}>
                  {displayPartnerName}持ち出し:
                </Grid>
                <Grid item>{expenceSum.partner.toLocaleString()} 円</Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction={"row"}>
                <Grid item width={"200px"}>
                  {displayPartnerName}不足:
                </Grid>
                <Grid item>{expenceSum.lack.toLocaleString()} 円</Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
