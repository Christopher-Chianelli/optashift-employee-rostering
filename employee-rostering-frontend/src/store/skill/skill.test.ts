/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { mockStore } from '../mockStore';
import { AppState } from '../types';
import * as actions from './actions';
import * as spotActions from 'store/spot/actions';
import * as employeeActions from 'store/employee/actions';
import reducer, { skillOperations } from './index';
import { withElement, withoutElement, withUpdatedElement } from 'util/ImmutableCollectionOperations';
import { onGet, onPost, onDelete } from 'store/rest/RestTestUtils';
import Skill from 'domain/Skill';

describe('Skill operations', () => {
  it('should dispatch actions and call client on refresh skill list', async () => {
    const { store, client } = mockStore(state);
    const tenantId = store.getState().tenantData.currentTenantId;
    const mockSkillList = [{
      tenantId: tenantId,
      id: 0,
      version: 0,
      name: "Skill 1"
    },
    {
      tenantId: tenantId,
      id: 1,
      version: 0,
      name: "Skill 2"
    },
    {
      tenantId: tenantId,
      id: 2,
      version: 0,
      name: "Skill 3"
    }];

    onGet(`/tenant/${tenantId}/skill/`, mockSkillList);
    await store.dispatch(skillOperations.refreshSkillList());
    expect(store.getActions()).toEqual([actions.refreshSkillList(mockSkillList)]);
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith(`/tenant/${tenantId}/skill/`);
  });
  
  it('should dispatch actions and call client on a successful delete skill', async () => {
    const { store, client } = mockStore(state);
    const tenantId = store.getState().tenantData.currentTenantId;
    const skillToDelete: Skill = { tenantId: tenantId, name: "test", id: 12345, version: 0 };
    onDelete(`/tenant/${tenantId}/skill/${skillToDelete.id}`, true);
    await store.dispatch(skillOperations.removeSkill(skillToDelete));
    expect(store.getActions()).toEqual([actions.removeSkill(skillToDelete)]);
    expect(client.delete).toHaveBeenCalledTimes(1);
    expect(client.delete).toHaveBeenCalledWith(`/tenant/${tenantId}/skill/${skillToDelete.id}`);
  });

  it('should call client but not dispatch actions on a failed delete skill', async () => {
    const { store, client } = mockStore(state);
    const tenantId = store.getState().tenantData.currentTenantId;
    const skillToDelete: Skill = { tenantId: tenantId, name: "test", id: 12345, version: 0 };
    onDelete(`/tenant/${tenantId}/skill/${skillToDelete.id}`, false);
    await store.dispatch(skillOperations.removeSkill(skillToDelete));
    expect(store.getActions()).toEqual([]);
    expect(client.delete).toHaveBeenCalledTimes(1);
    expect(client.delete).toHaveBeenCalledWith(`/tenant/${tenantId}/skill/${skillToDelete.id}`);
  });
    
  it('should dispatch actions and call client on add skill', async () => {
    const { store, client } = mockStore(state);
    const tenantId = store.getState().tenantData.currentTenantId;
    const skillToAdd: Skill = { tenantId: tenantId, name: "test" };
    const skillWithUpdatedId: Skill = {...skillToAdd, id: 4, version: 0};
    onPost(`/tenant/${tenantId}/skill/add`, skillToAdd, skillWithUpdatedId);
    await store.dispatch(skillOperations.addSkill(skillToAdd));
    expect(store.getActions()).toEqual([actions.addSkill(skillWithUpdatedId)]);
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith(`/tenant/${tenantId}/skill/add`, skillToAdd);
  });

  it('should dispatch actions and call client on update skill', async () => {
    const { store, client } = mockStore(state);
    const tenantId = store.getState().tenantData.currentTenantId;
    const skillToUpdate: Skill = { tenantId: tenantId, name: "test" , id: 4, version: 0 };
    const skillWithUpdatedVersion: Skill = {...skillToUpdate, id: 4, version: 1};
    onPost(`/tenant/${tenantId}/skill/update`, skillToUpdate, skillWithUpdatedVersion);
    onGet(`/tenant/${tenantId}/spot/`, []);
    onGet(`/tenant/${tenantId}/employee/`, []);
    await store.dispatch(skillOperations.updateSkill(skillToUpdate));
    expect(store.getActions()).toEqual([actions.updateSkill(skillWithUpdatedVersion), spotActions.refreshSpotList([]), employeeActions.refreshEmployeeList([])]);
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledTimes(2);
    expect(client.post).toHaveBeenCalledWith(`/tenant/${tenantId}/skill/update`, skillToUpdate);
    expect(client.get).toHaveBeenCalledWith(`/tenant/${tenantId}/spot/`);
    expect(client.get).toHaveBeenCalledWith(`/tenant/${tenantId}/employee/`);
  });
});

describe('Skill reducers', () => {
  const addedSkill: Skill = {tenantId: 0, id: 4321, version: 0, name: "Skill 1"};
  const updatedSkill: Skill = {tenantId: 0, id: 1234, version: 1, name: "Updated Skill 2"};
  const deletedSkill: Skill = {tenantId: 0, id: 2312, version: 0, name: "Skill 3"};
  it('add skill', () => {
    expect(
      reducer(state.skillList, actions.addSkill(addedSkill))
    ).toEqual({skillList: withElement(state.skillList.skillList, addedSkill)})
  });
  it('remove skill', () => {
    expect(
      reducer(state.skillList, actions.removeSkill(deletedSkill)),
    ).toEqual({skillList: withoutElement(state.skillList.skillList, deletedSkill)})
  });
  it('update skill', () => {
    expect(
      reducer(state.skillList, actions.updateSkill(updatedSkill)),
    ).toEqual({skillList: withUpdatedElement(state.skillList.skillList, updatedSkill)})
  });
  it('refresh skill list', () => {
    expect(
      reducer(state.skillList, actions.refreshSkillList([addedSkill])),
    ).toEqual({skillList: [addedSkill]});
  });
});

const state: AppState = {
  tenantData: {
    currentTenantId: 0,
    tenantList: []
  },
  employeeList: {
    employeeList: []
  },
  contractList: {
    contractList: []
  },
  spotList: {
    spotList: []
  },
  skillList: {
    skillList: [
      {
        tenantId: 0,
        id: 1234,
        version: 0,
        name: "Skill 2"
      },
      {
        tenantId: 0,
        id: 2312,
        version: 1,
        name: "Skill 3"
      }
    ]
  }
};