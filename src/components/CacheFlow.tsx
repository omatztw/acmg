import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { CSVData } from "../models/types";

type Props = {
  data: CSVData[];
};

export const CacheFlow = ({ data }: Props) => {
  return (
    <>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>計算対象</TableCell>
            <TableCell>日付</TableCell>
            <TableCell>内容</TableCell>
            <TableCell>金額（円）</TableCell>
            <TableCell>保有金融機関</TableCell>
            <TableCell>大項目</TableCell>
            <TableCell>中項目</TableCell>
            <TableCell>メモ</TableCell>
            <TableCell>振替</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.計算対象}</TableCell>
              <TableCell>{row.日付}</TableCell>
              <TableCell>{row.内容}</TableCell>
              <TableCell align='right'>{row["金額（円）"]}</TableCell>
              <TableCell>{row.保有金融機関}</TableCell>
              <TableCell>{row.大項目}</TableCell>
              <TableCell>{row.中項目}</TableCell>
              <TableCell>{row.メモ}</TableCell>
              <TableCell>{row.振替}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
