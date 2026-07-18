import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  EmployeeNumber,
  FullName,
  PersonalInformation,
  PersonalInformationProps,
  EmployeeStatus,
} from '../value-objects';
import { EmployeeContact, EmployeeContactProps } from '../entities/employee-contact.entity';
import { EmployeeAddress, EmployeeAddressProps } from '../entities/employee-address.entity';
import {
  EmployeeEmergencyContact,
  EmployeeEmergencyContactProps,
} from '../entities/employee-emergency-contact.entity';
import { EmployeeDocument, EmployeeDocumentProps } from '../entities/employee-document.entity';

export interface EmployeeProps {
  tenantId: Identifier;
  principalId: Identifier;
  employeeNo: EmployeeNumber;
  fullName: FullName;
  personalInfo: PersonalInformation;
  avatarFileId?: string;
  status: EmployeeStatus;
  metadata?: Record<string, unknown>;
  contacts: EmployeeContact[];
  addresses: EmployeeAddress[];
  emergencyContacts: EmployeeEmergencyContact[];
  documents: EmployeeDocument[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateEmployeeProps {
  tenantId: Identifier;
  principalId: Identifier;
  employeeNo: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  personalInfo?: PersonalInformationProps;
}

export class Employee extends AggregateRoot<EmployeeProps> {
  static create(props: CreateEmployeeProps): Employee {
    const now = new Date();
    return new Employee(Identifier.create(), {
      tenantId: props.tenantId,
      principalId: props.principalId,
      employeeNo: EmployeeNumber.create(props.employeeNo),
      fullName: FullName.create(props.firstName, props.lastName, props.preferredName),
      personalInfo: PersonalInformation.create(props.personalInfo ?? {}),
      status: EmployeeStatus.ACTIVE,
      contacts: [],
      addresses: [],
      emergencyContacts: [],
      documents: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: EmployeeProps): Employee {
    return new Employee(id, props);
  }

  // --- Getters ---

  get tenantId() {
    return this.props.tenantId;
  }

  get principalId() {
    return this.props.principalId;
  }

  get employeeNo() {
    return this.props.employeeNo;
  }

  get fullName() {
    return this.props.fullName;
  }

  get personalInfo() {
    return this.props.personalInfo;
  }

  get avatarFileId() {
    return this.props.avatarFileId;
  }

  get status() {
    return this.props.status;
  }

  get metadata() {
    return this.props.metadata;
  }

  get contacts(): readonly EmployeeContact[] {
    return this.props.contacts;
  }

  get addresses(): readonly EmployeeAddress[] {
    return this.props.addresses;
  }

  get emergencyContacts(): readonly EmployeeEmergencyContact[] {
    return this.props.emergencyContacts;
  }

  get documents(): readonly EmployeeDocument[] {
    return this.props.documents;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  linkPrincipal(principalId: Identifier): void {
    this.props.principalId = principalId;
    this.touch();
  }

  updateName(firstName: string, lastName: string, preferredName?: string): void {
    this.props.fullName = FullName.create(firstName, lastName, preferredName);
    this.touch();
  }

  updatePersonalInfo(info: PersonalInformationProps): void {
    this.props.personalInfo = PersonalInformation.create(info);
    this.touch();
  }

  changeAvatar(fileId?: string): void {
    this.props.avatarFileId = fileId;
    this.touch();
  }

  activate(): void {
    this.props.status = EmployeeStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = EmployeeStatus.INACTIVE;
    this.touch();
  }

  terminate(): void {
    this.props.status = EmployeeStatus.TERMINATED;
    this.props.deletedAt = new Date();
    this.touch();
  }

  // --- Child: Contacts ---

  addContact(props: Omit<EmployeeContactProps, 'employeeId' | 'createdAt'>): EmployeeContact {
    const contact = EmployeeContact.create({ ...props, employeeId: this.id });
    this.props.contacts.push(contact);
    this.touch();
    return contact;
  }

  removeContact(contactId: Identifier): void {
    this.props.contacts = this.props.contacts.filter((c) => !c.id.equals(contactId));
    this.touch();
  }

  // --- Child: Addresses ---

  addAddress(props: Omit<EmployeeAddressProps, 'employeeId' | 'createdAt'>): EmployeeAddress {
    const address = EmployeeAddress.create({ ...props, employeeId: this.id });
    this.props.addresses.push(address);
    this.touch();
    return address;
  }

  removeAddress(addressId: Identifier): void {
    this.props.addresses = this.props.addresses.filter((a) => !a.id.equals(addressId));
    this.touch();
  }

  // --- Child: Emergency Contacts ---

  addEmergencyContact(
    props: Omit<EmployeeEmergencyContactProps, 'employeeId' | 'createdAt'>,
  ): EmployeeEmergencyContact {
    const contact = EmployeeEmergencyContact.create({ ...props, employeeId: this.id });
    this.props.emergencyContacts.push(contact);
    this.touch();
    return contact;
  }

  removeEmergencyContact(contactId: Identifier): void {
    this.props.emergencyContacts = this.props.emergencyContacts.filter(
      (c) => !c.id.equals(contactId),
    );
    this.touch();
  }

  // --- Child: Documents ---

  addDocument(props: Omit<EmployeeDocumentProps, 'employeeId' | 'createdAt'>): EmployeeDocument {
    const doc = EmployeeDocument.create({ ...props, employeeId: this.id });
    this.props.documents.push(doc);
    this.touch();
    return doc;
  }

  removeDocument(documentId: Identifier): void {
    this.props.documents = this.props.documents.filter((d) => !d.id.equals(documentId));
    this.touch();
  }

  // --- Private ---

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
