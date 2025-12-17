import React, { useEffect, useState } from "react";
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";

const List = ({url}) => {
  //const url = "http://localhost:4000";
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/medical/list`);
      console.log(response.data);

      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching data");
      }

    } catch {
      toast.error("Network error");
    }
  
};

  const removeFood = async (medicalId) => {
    const response = await axios.post(`${url}/api/medical/remove`, { id: medicalId });

    if (response.data.success) {
      toast.success("Deleted successfully!");
      fetchList();
    } else {
      toast.error("Failed to delete");
    }
  };
   

 useEffect(() => {
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/medical/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching data");
      }
    } catch {
      toast.error("Network error");
    }
  };

  fetchList();
}, []);


  return (
    <div className='list add flex-col'>
      <p>All Equipments List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Quantity</b>
          <b>Action</b>
        </div>
        {list.map((item,index)=>{
          return(
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/`+item.image} alt=""  />
              <p>{item.name} </p>
              <p>{item.category} </p>
              <p>{item.price}tk </p>
              <p>{item.quantity} </p>
              <p onClick={()=>removeFood(item._id)} className='cursor'>X</p>


            </div>
          )
        })}
      </div>
    </div>
  );
};

export default List;
