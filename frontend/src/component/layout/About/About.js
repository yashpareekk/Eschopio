import React from "react";
import "./About.css";
import {  Typography, Avatar } from "@material-ui/core";
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';

const About = () => {
  console.log("Hellolo")
  return (
    <div className="aboutSection">
      <div></div>
      <div className="aboutSectionGradient"></div>
      <div className="aboutSectionContainer">
        <Typography component="h1">About Us</Typography>

        <div>
          <div>
            <Avatar
              style={{ width: "10vmax", height: "10vmax", margin: "2vmax 0" }}
              src="https://www.nawpic.com/media/2020/black-panther-nawpic-31.jpg"
              alt="Founder"
            />
            <Typography>Yash Pareek</Typography>
           
            <span>
            At Eschopio, we believe in the power of choice. Our mission is to provide an unparalleled online shopping experience that empowers customers with a wide array of products at competitive prices.
            Founded with the vision of simplifying e-commerce, Eschopio is more than just a platform - it's a community. We connect sellers with buyers, fostering an environment of trust and transparency.
            </span>
          </div>
          <div className="aboutSectionContainer2">
             <Typography component="h2">Our Brands</Typography>
            <a
             
              target="blank"
            >
              <YouTubeIcon className="youtubeSvgIcon" />
            </a>

            <a href="https://www.instagram.com/realyashpareek" target="blank">
            
              <InstagramIcon className="instagramSvgIcon" />
              </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;