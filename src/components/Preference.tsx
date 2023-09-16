import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  list: any[];
  setList: (list: any[]) => void;
  title: string;
};

export const Preference = ({ list, setList, title }: Props) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { value } = e.target;
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const handleRemoveClick = (index: number) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setList([...list, ""]);
  };
  return (
    <>
      <Typography variant='h5' sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Button
        sx={{ mt: 1 }}
        variant='contained'
        size='small'
        onClick={handleAddClick}
      >
        Add
      </Button>
      {list.map((x, i) => {
        return (
          <Grid container key={i} sx={{ mt: 1 }}>
            <Grid item sx={{ mr: 1 }}>
              <TextField
                name='value'
                value={x}
                size='small'
                onChange={(e) => handleInputChange(e, i)}
              />
            </Grid>

            <Grid item alignItems='stretch' style={{ display: "flex" }}>
              <IconButton
                aria-label='delete'
                onClick={() => handleRemoveClick(i)}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
};
