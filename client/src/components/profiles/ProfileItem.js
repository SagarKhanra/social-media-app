import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import isEmpty from '../../validation/is-empty';

class ProfileItem extends Component {
  render() {
    const { profile } = this.props;
    
    return (
      <div className="card card-body bg-light mb-3">
        <div className="row">
          <div className="col-2">
             <img  className="rounded-circle"  
             src={profile && profile.user ? `https://${profile.user.avatar}` : ``}
             alt={profile && profile.user ? profile.user.name : ``}
            />
          </div>
          <div className="col-lg-6 col-md-4 col-8">
            <h3>{profile && profile.user && profile.user.name}</h3>
            <p>
              {profile && profile.status}{' '}
              {isEmpty(profile && profile.company) ? null : (
                <span>at {profile && profile.company}</span>
              )}
            </p>
            <p>
              {isEmpty(profile && profile.location) ? null : (
                <span>{profile && profile.location}</span>
              )}
            </p>
            <Link to={`/profile/${profile && profile.handle}`} className="btn btn-info">
              View Profile
            </Link>
          </div>
          <div className="col-md-4 d-none d-md-block">
            <h4>Skill Set</h4>
            <ul className="list-group">
              {profile && profile.skills.slice(0, 4).map((skill, index) => (
                <li key={index} className="list-group-item">
                  <i className="fa fa-check pr-1" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

ProfileItem.propTypes = {
  profile: PropTypes.object.isRequired
};

export default ProfileItem;
