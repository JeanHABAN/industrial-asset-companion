package com.awc.industrial_asset_companion.liftstations;

import com.awc.industrial_asset_companion.liftstations.shared.Ids;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

@Entity
@EntityListeners(Ids.class)
@Table(name="lift_stations", indexes = {
        @Index(name="ix_ls_code", columnList="code", unique=true),
        @Index(name="ix_ls_geo", columnList="latitude,longitude")
})
public class LiftStation {
    @Id
    private UUID id;

    @NotBlank
    @Column(length=64, nullable=false, unique=true) private String code;
    @NotBlank @Column(length=160, nullable=false) private String name;

    @Column(length=160) private String addressLine1;
    @Column(length=80)  private String city;
    @Column(length=32)  private String state;
    @Column(length=16)  private String zip;

    @Column(nullable=false) private Double latitude;
    @Column(nullable=false) private Double longitude;

    @Column(length=160) private String serviceArea;
    private Double wetWellDepthFt;
    private Integer pumpsCount;
    @Column(length=80) private String commsType;

    @Lob private String notes;

    @Column(nullable=false) private Instant createdAt = Instant.now();

    // getters/setters
    public UUID getId(){return id;} public void setId(UUID id){this.id=id;}
    public String getCode(){return code;} public void setCode(String code){this.code=code;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getAddressLine1(){return addressLine1;} public void setAddressLine1(String v){this.addressLine1=v;}
    public String getCity(){return city;} public void setCity(String v){this.city=v;}
    public String getState(){return state;} public void setState(String v){this.state=v;}
    public String getZip(){return zip;} public void setZip(String v){this.zip=v;}
    public Double getLatitude(){return latitude;} public void setLatitude(Double v){this.latitude=v;}
    public Double getLongitude(){return longitude;} public void setLongitude(Double v){this.longitude=v;}
    public String getServiceArea(){return serviceArea;} public void setServiceArea(String v){this.serviceArea=v;}
    public Double getWetWellDepthFt(){return wetWellDepthFt;} public void setWetWellDepthFt(Double v){this.wetWellDepthFt=v;}
    public Integer getPumpsCount(){return pumpsCount;} public void setPumpsCount(Integer v){this.pumpsCount=v;}
    public String getCommsType(){return commsType;} public void setCommsType(String v){this.commsType=v;}
    public String getNotes(){return notes;} public void setNotes(String v){this.notes=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){this.createdAt=v;}
}
