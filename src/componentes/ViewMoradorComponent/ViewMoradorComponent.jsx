import React, { PureComponent } from "react";
import MoradorService from "../../services/MoradorService";
import ApartamentoService from "../../services/ApartamentoService";
import "./ViewMoradorComponent.css";

class ViewMoradorComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.match.params.id,
      morador: {},
    };
  }

  componentDidMount() {
    MoradorService.getMoradorById(this.state.id)
      .then(res => {
        this.setState({ morador: res.data });
      })
      .then(() => {
        this.getApartamento(this.state.morador.apartamentoMorador)
      });
  }

  getApartamento = (apartamentoId) => {
    ApartamentoService.getApartamentoById(apartamentoId)
      .then(res => {
        this.setState({ 
          morador: {
            ...this.state.morador,
            apto: res.data.numero,
            torre: res.data.torre
          }
        });
      });
  }

  listarTodos = () => {
    this.props.history.push("/moradores");
  };

  render() {
    return (
      <div>
        <div className="card col-md-8 offset-md-2 viewApartamento__card">
          <h3>Ver detalhes do morador</h3>
          <div className="card-body">
            <div className="row">
              <strong>Nome:</strong>
              <div className="divisor" />
              <div>{this.state.morador?.nome}</div>
            </div>
            <div className="row">
              <strong>Telefone:</strong>
              <div className="divisor" />
              <div>{this.state.morador?.telefone}</div>
            </div>
            <div className="row">
              <strong>Documento:</strong>
              <div className="divisor" />
              <div>{this.state.morador?.documento}</div>
            </div>
            <div className="row">
              <strong>Apto:</strong>
              <div className="divisor" />
              <div>
                {this.state.morador?.apto} - {this.state.morador?.torre}
              </div>
            </div>
            <button className="btn btn-info" onClick={this.listarTodos}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ViewMoradorComponent;