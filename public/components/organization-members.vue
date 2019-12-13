<template>
  <v-container fluid class="pa-0">
    <v-layout row wrap class="mt-3">
      <h3 class="title my-3">
        {{ $t('common.members') }} <span v-if="members">({{ $n(members.count) }})</span>
      </h3>
      <v-btn v-if="isAdminOrga" :title="$t('pages.organization.addMember')" icon color="primary" @click="newInvitation(); inviteMemberDialog = true"><v-icon>add</v-icon></v-btn>
    </v-layout>

    <v-layout row wrap>
      <v-text-field
        :label="$t('common.search')"
        v-model="q"
        name="search"
        solo
        style="max-width:300px;"
        append-icon="search"
        @click:append="fetchMembers"
        @keyup.enter="fetchMembers"/>
      <v-spacer/>
      <v-pagination v-if="members && members.count > membersPageSize" :length="Math.ceil(members.count / membersPageSize)" v-model="membersPage" @input="fetchMembers"/>
    </v-layout>

    <v-list v-if="members" two-line class="elevation-1 mt-1">
      <v-list-tile v-for="member in members.results" :key="member.id">
        <v-list-tile-content>
          <v-list-tile-title>{{ member.name }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ member.email }}</v-list-tile-sub-title>
          <v-list-tile-sub-title>
            <span>{{ $t('common.role') }} = {{ member.role }}</span>
            <span v-if="member.department">, {{ orga.departmentLabel || $t('common.department') }} = {{ member.department }}</span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action v-if="isAdminOrga && member.id !== userDetails.id">
          <v-btn :title="$t('pages.organization.editMember')" flat icon @click="currentMember = member; newRole = member.role; newDepartment = member.department; editMemberDialog = true">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn :title="$t('pages.organization.deleteMember')" flat icon color="warning" @click="currentMember = member;deleteMemberDialog = true">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-dialog v-model="inviteMemberDialog" max-width="500px">
      <v-card v-if="orga">
        <v-card-title primary-title>
          {{ $t('pages.organization.addMember') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="inviteForm" v-model="validInvitation">
            <v-text-field
              id="id"
              v-model="invitation.email"
              :label="$t('pages.organization.inviteEmail')"
              :rules="[v => !!v || '']"
              name="email"
              required
            />
            <v-select
              :items="orga.roles"
              v-model="invitation.role"
              :label="$t('common.role')"
              :rules="[v => !!v || '']"
              name="role"
            />
            <v-select
              v-if="env.manageDepartments && orga.departments && orga.departments.length"
              :items="orga.departments"
              v-model="invitation.department"
              :label="orga.departmentLabel || $t('common.department')"
              item-value="id"
              item-text="name"
              name="department"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat @click="inviteMemberDialog = false">{{ $t('common.confirmCancel') }}</v-btn>
          <v-btn color="warning" @click="confirmInvitation()">{{ $t('common.confirmOk') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteMemberDialog" max-width="500px">
      <v-card v-if="currentMember">
        <v-card-title primary-title>
          {{ $t('pages.organization.confirmDeleteMemberTitle', {name: currentMember.name}) }}
        </v-card-title>
        <v-card-text>
          {{ $t('pages.organization.confirmDeleteMemberMsg') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat @click="deleteMemberDialog = false">{{ $t('common.confirmCancel') }}</v-btn>
          <v-btn color="warning" @click="deleteMemberDialog = false;deleteMember(currentMember)">{{ $t('common.confirmOk') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editMemberDialog" max-width="500px">
      <v-card v-if="currentMember">
        <v-card-title primary-title>
          {{ $t('pages.organization.confirmEditMemberTitle', {name: currentMember.name}) }}
        </v-card-title>
        <v-card-text>
          <v-select :items="orga.roles" v-model="newRole" :label="$t('common.role')" />
          <v-select
            v-if="env.manageDepartments && orga.departments && orga.departments.length"
            :items="orga.departments"
            v-model="newDepartment"
            :label="orga.departmentLabel || $t('common.department')"
            item-value="id"
            item-text="name"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat @click="editMemberDialog = false">{{ $t('common.confirmCancel') }}</v-btn>
          <v-btn color="warning" @click="editMemberDialog = false;setMemberRole(currentMember, newRole, newDepartment)">{{ $t('common.confirmOk') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import eventBus from '../event-bus'

export default {
  props: {
    isAdminOrga: {
      type: Boolean,
      default: null
    },
    orga: {
      type: Object,
      default: null
    }
  },
  data: () => ({
    members: null,
    roles: null,
    q: '',
    deleteMemberDialog: false,
    editMemberDialog: false,
    currentMember: null,
    invitation: { id: null, email: null, role: null },
    inviteMemberDialog: false,
    validInvitation: true,
    membersPage: 1,
    membersPageSize: 10,
    newRole: null,
    newDepartment: null
  }),
  computed: {
    ...mapState(['userDetails', 'env'])
  },
  async mounted() {
    this.fetchMembers()
  },
  methods: {
    async fetchMembers() {
      try {
        this.members = await this.$axios.$get(`api/organizations/${this.orga.id}/members`,
          { params: { q: this.q, page: this.membersPage, size: this.membersPageSize } })
      } catch (error) {
        eventBus.$emit('notification', { error })
      }
    },
    async deleteMember(member) {
      try {
        await this.$axios.$delete(`api/organizations/${this.orga.id}/members/${member.id}`)
        eventBus.$emit('notification', this.$t('pages.organization.deleteMemberSuccess', { name: member.name }))
        this.fetchMembers()
      } catch (error) {
        eventBus.$emit('notification', { error })
      }
    },
    newInvitation() {
      this.invitation = { id: this.orga.id, name: this.orga.name, email: '', role: null, department: null }
      this.$refs.inviteForm.reset()
    },
    async confirmInvitation() {
      if (this.$refs.inviteForm.validate()) {
        this.inviteMemberDialog = false
        try {
          await this.$axios.$post(`api/invitations/`, this.invitation)
          eventBus.$emit('notification', this.$t('pages.organization.inviteSuccess', { email: this.invitation.email }))
        } catch (error) {
          eventBus.$emit('notification', { error })
        }
      }
    },
    async setMemberRole(member, newRole, newDepartment) {
      member.role = newRole
      member.department = newDepartment
      try {
        await this.$axios.patch(`api/organizations/${this.orga.id}/members/${member.id}`, { role: newRole, department: newDepartment })
      } catch (error) {
        eventBus.$emit('notification', { error })
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>